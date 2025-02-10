import type { NextApiRequest, NextApiResponse } from "next";
import { CozeAPI, COZE_CN_BASE_URL,RoleType, ChatEventType } from '@coze/api';

const cozeClient = new CozeAPI({
    token: process.env.COZE_API_KEY!,
    allowPersonalAccessTokenInBrowser: true,
    baseURL: COZE_CN_BASE_URL
});

export default async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const stream = await cozeClient.chat.stream({
        bot_id: process.env.COZE_BOT_ID!,
        additional_messages: [{
            role: RoleType.User,
            content: "hello",
            content_type: 'text',
        }],
    })
    for await (const part of stream) {
        if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
            console.log(part.data.content); // Real-time response
        }
    }
    res.status(200).json({ message: 'Success' });
}
