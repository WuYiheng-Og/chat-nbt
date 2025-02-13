import { NextRequest, NextResponse } from 'next/server'; 
import { CozeAPI, COZE_CN_BASE_URL,RoleType, ChatEventType} from '@coze/api';
import OSS from 'ali-oss'
import fs from 'fs'
import { Readable } from 'stream';

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
    size:number,
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
})

async function fileToBuffer(file:File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function POST(
    req: NextRequest, 
)  { 
        const formData = await req.formData();
        console.log('获取发送的消息：',formData);
        console.log(formData.getAll('file'));
        // 声明数组并指定元素类型
        const formatFiles: FormattedFile[] = [];  
        try {
            const filePaths = formData.getAll('url');
            let index = 0;
            for (const file of formData.getAll('file')) {
                if(file instanceof File) {
                    // 发送请求[文件上传到coze解析]
                    // TODO 这个文件死活传不上去
                    const filePath = filePaths[index++];
                    console.log('filePath',filePath);
                    
                    const fileBuffer = await fs.createReadStream(filePath as string); 
                    const aiFile = await cozeClient.files.upload({
                        file: fileBuffer
                    });  
                    console.log('接收coze上传文件的信息：',aiFile.id);
                    
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
            return NextResponse.json({ formatFiles: formatFiles }, { status: 200 });
        } catch (error) {
            console.log(error);
            return NextResponse.json({ message: '无法解析内容' }, { status: 500 });
        }
}

// 查看上传文件解析的内容
export async function GET(req: NextRequest) {
        // 获取路径携带参数
        const { searchParams } = new URL(req.url);
        const fileKey = searchParams.get('fileKey');
    try {
        if (!fileKey) {
            return NextResponse.json({ error: '文件传入Key出错' }, { status: 400 });
        }
        const fileResponse = await cozeClient.files.retrieve(fileKey);
        console.log(fileResponse);
        
        // if(fileResponse && fileResponse.code) {
        //     const fileContent = await fileResponse.data;
        //     return NextResponse.json({ fileContent }, { status: 200 });
        // }else {
        //     return NextResponse.json({ error: fileResponse.msg }, { status: 500 });
        // }
        
    } catch (error) {
        console.error('Error getting file content:', error);
        return NextResponse.json({ error: '无法获取文件内容' }, { status: 500 });
    }
}

// 将 File 对象转换为可读流的函数
// async function fileToReadableStream(file: File) {
//     let offset = 0;
//     const chunkSize = 1024 * 1024; // 每次读取 1MB

//     const readable = new Readable({
//         async read(size) {
//             if (offset >= file.size) {
//                 this.push(null); // 结束流
//                 return;
//             }
//             const end = Math.min(offset + chunkSize, file.size);
//             const blob = await file.slice(offset, end);
//             const arrayBuffer = await blob.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
//             this.push(buffer);
//             offset = end;
//         }
//     });

//     return readable;
// }
