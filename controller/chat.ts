import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { GPTModel } from "@/lib/types";
import {fetchMutation, fetchQuery} from 'convex/nextjs'

// 文件元数据
type FormattedFile = {
    key: string,// 通过key可以索引url
    name: string,
    type: string,
    size:number,
}
type MessageType = {
    role: "system" | "user" | "assistant";
    content: string;
    metaInfo: FormattedFile,
};


// coze的多模态消息
type MessageAttachmentType = {
    type: "text" | "file" | "image";
    text?: string;
    file_id?: string; //用来索引文件的key
}


interface sendMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    chatId: Id<"chats">;
    attachmentMetaInfoList?: FormattedFile[];
    curUser: Doc<'users'>; // 当前用户信息
}
export default async function sendMessage (args: sendMessageProps, signal: AbortSignal)  {

    // 检查是否有附件
    if(args.attachmentMetaInfoList && args.attachmentMetaInfoList.length>0){
        console.log('有附件，开始多模态处理：',args.attachmentMetaInfoList);
        
        await handleAttachments(args);
    }
    // 没有附件
    else {
        console.log('没有附件，直接处理回答：');
        await fetchMutation(api.messages.send, {
            role: args.role,
            content: args.content,
            chatId: args.chatId,
        })
    }
     
    // 向大模型提问
    // 1.提取最近的几条信息
    const messages = await fetchQuery(api.messages.retrieve, {
        chatId: args.chatId
    })
    if(!messages)  {
        console.log('消息不存在');
        throw new Error("未获取最近的几条信息！")
        return null;
    }
    // 注意，最后一条消息必须是用户的问题。
    messages.reverse();
    const formattedMessages = messages.map((message) => {
        if(message.attachmentMetaInfoList && message.attachmentMetaInfoList.length>0){
            return {
                role: message.role,
                // content: JSON.stringify(messageAttachments),
                content: JSON.stringify(convertToObjectString(message.attachmentMetaInfoList, message.content)),
                content_type: 'object_string'
            }
        }else {
            return {
                role: message.role,
                content: message.content,
                content_type: 'text'
            }
        }
    }); 
    console.log('formatedMessages-------',formattedMessages);
    
    try {
        const GPTVersion = args.curUser.model === GPTModel.KIMI ? "moonshot" : "coze";
        console.log('开始请求大模型:',GPTVersion);
        const response = await fetch(`/api/${GPTVersion}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formattedMessages }),
            signal
        });
        if (!response.ok) {
            console.log(response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 保存回答的消息
        const newAssistantMessageId = await fetchMutation(api.messages.send, {
            role: "assistant",
            content: '',
            chatId: args.chatId
        });
        // 处理流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        while (true) {
            const readResult = await reader?.read();
            if (readResult?.done) {
                break;
            }
            // 检查 readResult 是否包含 value 属性
            if (readResult && 'value' in readResult) {
                const chunk = decoder.decode(readResult.value);
                // console.log(chunk);
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    fullResponse+=line;
                    await fetchMutation(api.messages.update,{
                        messageId: newAssistantMessageId,
                        content: fullResponse
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
        // throw new Error(`对话出错! status: ${error}`);
    }
}

async function parse_files(files: FormattedFile[]) {
    const messages:MessageType[] = [];
    // 对每个文件路径，我们都会抽取文件内容，最后生成一个 role 为 system 的 message，并加入
    // 到最终返回的 messages 列表中。
    for (const file of files) {
        const response = await fetch(`/api/moonshot/files?key=${file.key}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res =await response.json();
        console.log('解析文件内容：',res.fileContent);
        
        messages.push({
            role: "system",
            content: res.fileContent,
            metaInfo: file
        })
    } 
    return messages
}

// 处理附件
async function handleAttachments(args:sendMessageProps) {
    
    if(!args.attachmentMetaInfoList) return ;
    const GPTVersion = args.curUser.model === GPTModel.KIMI ? "moonshot" : "coze";
    // Kimi
    if(GPTVersion === "moonshot") {
        console.log('开始处理kimi多模态消息：');
        const fileMessages = await parse_files(args.attachmentMetaInfoList);
            for (const message of fileMessages) {
                // send user message 执行数据库操作,信息存入数据库
                await fetchMutation(api.messages.send,{
                    role: message.role,
                    content: message.content,
                    chatId: args.chatId,
                    attachmentMetaInfo: message.metaInfo
                })
            }      
        
        // send user message 执行数据库操作,信息存入数据库
        await fetchMutation(api.messages.send, {
            role: args.role,
            content: args.content,
            chatId: args.chatId,
            attachmentMetaInfoList: args.attachmentMetaInfoList 
        })
    }
    // Coze
    else {
        console.log('开始处理Coze多模态消息：');
        
        await fetchMutation(api.messages.send, {
            role: args.role,
            content: args.content,
            chatId: args.chatId,
            attachmentMetaInfoList: args.attachmentMetaInfoList 
        })
    }
    
}

function convertToObjectString(attachmentMetaInfoList: FormattedFile[], userContent: string):MessageAttachmentType[] {
    if(!attachmentMetaInfoList) return [];

    const messageAttachments: MessageAttachmentType[] = [];  
    messageAttachments.push({
        type: 'text',
        text: userContent
    })
    for( const attachmentMetaInfo of attachmentMetaInfoList ) {
        messageAttachments.push({
            type: attachmentMetaInfo.type.includes('image')?'image': 'file',
            file_id: attachmentMetaInfo.key
        })
    }
    return messageAttachments;
}