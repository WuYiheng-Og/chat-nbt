import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm } from 'formidable';
import OpenAI from 'openai' 
import fs from 'fs' 
import OSS from 'ali-oss'

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

export default async (
    req: NextApiRequest,
    res: NextApiResponse
) => { 
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Failed to parse form data' });
            } 
            // files 包含上传的文件
            // console.log('Files:', Object.values(files)[0]); 
            /**
             *     filepath: 'C:\\Users\\orange\\AppData\\Local\\Temp\\d7553245a5de9b198b35f7206',
                    newFilename: 'd7553245a5de9b198b35f7206',
                    originalFilename: 'mylogo.png',
                    mimetype: 'image/png',
                    hashAlgorithm: false,
                    size: 15888,
             */
            
            const filesObj = Object.values(files); 
            
            // 声明数组并指定元素类型
            const formatFiles: FormattedFile[] = [];  

            // 按顺序执行异步操作
            async function processFilesSequentially(files:formidable.File[]) {
                for (const file of files) {
                    try {
                        // 获取文件后缀
                        const fileName = file?.originalFilename || '';
                        const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
                        const oldTempFilePath = file?.filepath || '';
                        const tempFilePath = fileName + fileExtension;
                        const fileType = file?.mimetype || '';
                        const fileSize = file?.size || 0;

                        // 重命名文件（IncomingForm 缓存文件时，临时文件默认没有文件后缀。需要添加后缀让 kimi 识别）
                        await new Promise<void>((resolve, reject) => {
                            fs.rename(oldTempFilePath, tempFilePath, (err) => {
                                if (err) {
                                    console.error('重命名文件时出错:', err);
                                    reject(err);
                                } else {
                                    console.log('文件重命名成功');
                                    resolve();
                                }
                            });
                        });

                        try {
                            // 发送请求[文件上传到kimi解析]
                            const aiFile = await kimiClient.files.create({
                                file: fs.createReadStream(tempFilePath),
                                purpose: "file-extract" // TODO 暂时没解决：这里报错是因为 openai 的 purpose 没有 file-extract，但是 kimi 设置了这个，所以被 eslint 检查报错。
                            }); 
                            console.log('文件上传成功:', aiFile.id);
                            // 文件备份到阿里云，便于网络访问
                            await aliClient.put(`attachments/${aiFile.id}`, tempFilePath)
                            const formattedFile: FormattedFile = {
                                key: aiFile.id,
                                name: fileName,
                                type: fileType,
                                size: fileSize,
                            };
                            
                            formatFiles.push(formattedFile);
                        } catch (error) {
                            // 处理错误
                            console.error('文件创建失败:', error);
                            res.status(500).json({ message: '无法解析内容' });
                        }
                    } catch (error) {
                        res.status(500).json({ message: '无法解析内容' });
                        throw error; // 重新抛出错误，以便外部可以捕获
                    }
                }
            }

            // 调用函数处理文件
            await processFilesSequentially(filesObj[0]?? []);
            console.log('成功，传入客户端：',formatFiles);
            
            res.status(200).json({ message: 'Success',  formatFiles: formatFiles});

        })
  
}