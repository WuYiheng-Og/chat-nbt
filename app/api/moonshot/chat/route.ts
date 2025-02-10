// app/api/moonshot/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 创建 kimi 客户端
const kimiClient = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_API_URL,
});

export async function POST(req: NextRequest) {
    console.log('调用Moonshot api');
    
    try {
        // 从请求体中获取消息数据
        const { formattedMessages } = await req.json();

        // 检查消息数据是否存在
        if (!formattedMessages) {
            return NextResponse.json({ error: 'Missing formattedMessages in request body' }, { status: 400 });
        }

        // 创建流式聊天完成请求
        const stream = await kimiClient.chat.completions.create({
            model: 'moonshot-v1-8k',
            stream: true,
            messages: formattedMessages,
            temperature: 0.3,
        });

        // 设置响应头，指定响应为流式数据
        const headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        };

        // 创建一个可读流来处理流式响应
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    // 将每个数据块转换为字符串并添加到流中
                    const data = `data: ${JSON.stringify(chunk)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(data));
                }
                // 关闭流
                controller.close();
            },
        });

        // 返回流式响应
        return new NextResponse(readableStream, { headers });
    } catch (error) {
        console.error('Error creating chat completion stream:', error);
        return NextResponse.json({ error: 'Failed to create chat completion stream' }, { status: 500 });
    }
}