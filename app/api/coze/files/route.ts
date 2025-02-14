import { NextRequest, NextResponse } from 'next/server'; 
import { CozeAPI, COZE_CN_BASE_URL, RoleType, ChatEventType } from '@coze/api';
import OSS from 'ali-oss';
import fs from 'fs';
import path, { dirname } from 'path';

export const config = {
    api: {
        bodyParser: false, // 禁用默认的 bodyParser，以便手动解析 FormData
    },
};

// 文件元数据
type FormattedFile = {
    key: string, // 通过key可以索引url
    name: string,
    type: string,
    size: number,
}

// 创建 coze 客户端
const cozeClient = new CozeAPI({
    token: process.env.COZE_API_KEY!,
    baseURL: COZE_CN_BASE_URL
});

// 创建阿里云客户端
const aliClient = new OSS({
    region: process.env.ALI_OSS_REGION,
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALI_OSS_BUCKET
});

async function fileToBuffer(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function POST(
    req: NextRequest, 
) { 
    const formData = await req.formData();
    // console.log('获取发送的消息：', formData);
    // 声明数组并指定元素类型
    const formatFiles: FormattedFile[] = [];  
    try { 
        let index = 0;
        for (const file of formData.getAll('file')) {
            if (file instanceof File) {
                // 生成唯一的文件名
                const fileName = `${new Date().getTime()}_${file.name}`;
                // const dirname = process.cwd()
                // console.log('__dirname',process.cwd());
                const localFilePath = path.join(__dirname, 'uploads', fileName);

                // 创建上传目录（如果不存在）
                const uploadDir = path.join(__dirname, 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // 将文件内容写入本地文件
                const buffer = await fileToBuffer(file);
                fs.writeFileSync(localFilePath, buffer);

                // 使用 fs.createReadStream 读取本地文件
                const fileStream = fs.createReadStream(localFilePath);

                // console.log('filePath',localFilePath); 
                
                const aiFile = await cozeClient.files.upload({
                    file: fileStream
                });  
                console.log('接收coze上传文件的信息：', aiFile.id);
                
                // 文件备份到阿里云，便于网络访问 
                await aliClient.put(`attachments/${aiFile.id}`, buffer); 
                formatFiles.push({
                    key: aiFile.id,
                    name: file.name,
                    type: file.type,
                    size: file.size, 
                });

                // 删除本地临时文件
                fs.unlinkSync(localFilePath);
            }
        }
        return NextResponse.json({ formatFiles: formatFiles }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: '无法解析内容' }, { status: 500 });
    }
}


