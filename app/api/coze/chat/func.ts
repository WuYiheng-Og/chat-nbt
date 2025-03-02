import { CozeAPI, COZE_CN_BASE_URL, EnterMessage} from '@coze/api';
import { COZE_BOT_ID } from '@/lib/types';

const cozeClient = new CozeAPI({
    token: process.env.COZE_API_KEY!,
    baseURL: COZE_CN_BASE_URL
}); 
   
// 接收信息，请求coze api，返回stream流
export async function sendMsgByCoze(formattedMessages: object) { 
    
    console.log('调用coze api', process.env.COZE_API_KEY!);
    try { 
        // const parsedData = JSON.parse(formattedMessagesString);
        // const formattedMessages = parsedData.formattedMessages;
        // 创建流式聊天完成请求
        const stream = cozeClient.chat.stream({
            bot_id: COZE_BOT_ID!,
            additional_messages: formattedMessages as unknown as EnterMessage[],
        })
        
        return stream;

    }
    catch (error) {
    console.error('Failed to create chat completion stream:',error);
    return null;
    }
}
