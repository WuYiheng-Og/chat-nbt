import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

// 创建 kimi 客户端
const kimiClient = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_API_URL,
});

export async function sendMsgByMoonshot(formattedMessages: object) {
    console.log('调用Moonshot api');
    
    try { 

        // 创建流式聊天完成请求
        const stream = await kimiClient.chat.completions.create({
            model: 'moonshot-v1-8k',
            stream: true,
            messages: formattedMessages as unknown as Array<ChatCompletionMessageParam>,
            temperature: 0.3,
        });
        return stream;
 
    } catch (error) {
        console.error('Error creating chat completion stream:', error);
        return null;
    }
}

// 查看上传文件解析的内容
export async function parse_files_content(fileKey: string) {
    // 获取路径携带参数
    // const { searchParams } = new URL(req.url);
    // const fileKey = searchParams.get('key');
try {
    if (!fileKey) {
        console.error('文件传入Key出错');
        
    }
    const fileResponse = await kimiClient.files.content(fileKey);
    
    const fileContent = await fileResponse.text();
    return fileContent;
} catch (error) {
    console.error('Error getting file content:', error);
    console.error('无法获取文件内容');
}
}
