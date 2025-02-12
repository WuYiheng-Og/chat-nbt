import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
    metaInfo: FormattedFile
};


interface sendMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    chatId: Id<"chats">;
    attachmentMetaInfoList?: FormattedFile[];
}
export default async function sendMessage (args: sendMessageProps)  {
    console.log(args);
    // 先查询当前发送消息对象是否存在
    // const curUser = await fetchQuery(api.users.currentUser, {});
    // if (curUser === null){
    //     throw new Error("User not found");
    // }

    // 检查是否有附件
    if(args.attachmentMetaInfoList) {
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
    }
    // send user message 执行数据库操作,信息存入数据库
    await fetchMutation(api.messages.send, {
        role: args.role,
        content: args.content,
        chatId: args.chatId,
        attachmentMetaInfoList: args.attachmentMetaInfoList 
    })


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
    messages.reverse();
    const formattedMessages = messages.map(message => ({
        role: message.role,
        content: message.content
    })); 

    try {
        console.log('开始请求大模型。。。');
        
        // try {
            // TODO cozeapi 调用
            const response = await fetch('/api/coze/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ formattedMessages })
            });
            console.log(response);
            
        // } catch (error) {

        //     console.log('出错啦！！！！',error);
            
        // }
        // return
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
                console.log(chunk);
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    console.log(line);
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
        throw new Error(`HTTP error! status: ${error}`);
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