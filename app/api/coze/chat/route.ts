import { NextRequest, NextResponse } from 'next/server';
import { CozeAPI, COZE_CN_BASE_URL,RoleType, ChatEventType,ChatStatus, StreamChatData } from '@coze/api';

const cozeClient = new CozeAPI({
    token: process.env.COZE_API_KEY!,
    baseURL: COZE_CN_BASE_URL
});

export async function POST(req: NextRequest) {
    console.log('调用coze api');
    
    try {
        // 从请求体中获取消息数据
        const { formattedMessages } = await req.json();

        // 检查消息数据是否存在
        if (!formattedMessages) {
            return NextResponse.json({ error: 'Missing formattedMessages in request body' }, { status: 400 });
        }
        // // 创建流式聊天完成请求
        const stream = await cozeClient.chat.stream({
            bot_id: process.env.COZE_BOT_ID!,
            additional_messages: [{
                role: RoleType.User,
                content: formattedMessages,
                content_type: 'text',
            }],
        })
        // 设置响应头，指定响应为流式数据
        const headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        };

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chatData of stream) {
                    if (chatData.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
                        console.log('Received message delta:', chatData.data.content);
                        controller.enqueue(new TextEncoder().encode(chatData.data.content));
                    } else if (chatData.event === ChatEventType.ERROR) {
                        console.error('Chat error:', chatData.data.msg);
                    }
                }
                // 关闭流
                controller.close();
            }
        });
        // 返回流式响应
        return new NextResponse(readableStream, { headers });

    } catch (error) {
        console.error('Error creating chat completion stream:', error);
        return NextResponse.json({ error: 'Failed to create chat completion stream' }, { status: 500 });
    }
}

