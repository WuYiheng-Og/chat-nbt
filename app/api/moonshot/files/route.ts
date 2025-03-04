import OSS from 'ali-oss';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const config = {
    api: {
        bodyParser: false, // 禁用默认的 bodyParser，以便手动解析 FormData
    },
};
// 文件元数据
type FormattedFile = {
    key: string,// 通过key可以索引url
    name: string,
    type: string,
    size: number,
}
// 创建 kimi 客户端
const kimiClient = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_API_URL,
})

// 创建阿里云客户端
const aliClient = new OSS({
    region: process.env.ALI_OSS_REGION,
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALI_OSS_BUCKET
})

async function fileToBuffer(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function POST(
    req: NextRequest,
) {
    const formData = await req.formData();
    // console.log('kimi获取发送的消息：',formData);
    // 声明数组并指定元素类型
    const formatFiles: FormattedFile[] = [];
    try {
        for (const file of formData.values()) {
            if (file instanceof File) {
                // 发送请求[文件上传到kimi解析]
                // 【注意哈，如果这里报错400invalid_request_error，把purpose: vision改成file-extract即可】
                const aiFile = await kimiClient.files.create({
                    file: file,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    purpose: "vision" // TODO 暂时没解决：这里报错是因为 openai 的 purpose 没有 file-extract，但是 kimi 设置了这个，所以被 eslint 检查报错。
                    // purpose: 'file-extract'
                });

                // 文件备份到阿里云，便于网络访问 
                const buffer = await fileToBuffer(file);
                await aliClient.put(`attachments/${aiFile.id}`, buffer);
                formatFiles.push({
                    key: aiFile.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                })
            }

        }
        // console.log('kimi成功解析，并上传文件',formatFiles);

        return NextResponse.json({ formatFiles: formatFiles }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: '无法解析内容' }, { status: 500 });
    }
}

