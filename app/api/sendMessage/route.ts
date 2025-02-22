import { sendMsgByCoze } from "@/app/api/coze/chat/func";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { GPTModel } from "@/lib/types";
import { ChatEventType } from "@coze/api";
import {fetchMutation, fetchQuery} from 'convex/nextjs';
import {NextRequest, NextResponse } from "next/server";
import { sendMsgByMoonshot,parse_files_content } from "../moonshot/chat/func";

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
export async function POST(req: NextRequest) {
    const args: sendMessageProps = await req.json();
    const signal = req.signal;  
    try {
      // 检查是否有附件
      if (args.attachmentMetaInfoList && args.attachmentMetaInfoList.length > 0) {
        console.log('有附件，开始多模态处理：', args.attachmentMetaInfoList);
        await handleAttachments(args);
      } else {
        console.log('没有附件，直接处理回答：');
        await fetchMutation(api.messages.send, {
          role: args.role,
          content: args.content,
          chatId: args.chatId,
        });
      }
  
      // 向大模型提问
      // 1.提取最近的几条信息
      const messages = await fetchQuery(api.messages.retrieve, {
        chatId: args.chatId,
      });
  
      if (!messages) {
        console.log('消息不存在');
        throw new Error('未获取最近的几条信息！');
      }
  
      // 注意，最后一条消息必须是用户的问题。
      messages.reverse();
      const formattedMessages = messages.map((message) => {
        if (message.attachmentMetaInfoList && message.attachmentMetaInfoList.length > 0) {
          return {
            role: message.role,
            content: JSON.stringify(convertToObjectString(message.attachmentMetaInfoList, message.content)),
            content_type: 'object_string',
          };
        } else {
          return {
            role: message.role,
            content: message.content,
            content_type: 'text',
          };
        }
      });
  
      console.log('formatedMessages-------', formattedMessages);
  
      const GPTVersion = args.curUser.model === GPTModel.KIMI ? 'moonshot' : 'coze';
        console.log('开始请求大模型:',GPTVersion);
        // kimi
        if(GPTVersion === 'moonshot') {
            const response = await sendMsgByMoonshot(formattedMessages);
            const stream = await response;
            console.log('请求结束-----------------',stream);
            
            if(stream) {
                // 保存回答的消息
                const newAssistantMessageId = await fetchMutation(api.messages.send, {
                    role: "assistant",
                    content: '',
                    chatId: args.chatId
                });
                // 处理流式响应
                let fullResponse = '';
                for await (const chunk of stream) {
                    // 检查信号是否中止, 如果点击暂停，则取消渲染，直接丢弃后续的数据块即可。 
                    if (signal.aborted) {
                        console.log('请求已中止，停止处理流式响应');
                        break;
                    }
                    // console.log(chunk.choices[0].delta.content);
                    // 将每个数据块转换为字符串并添加到流中
                    if (chunk.choices[0].delta.content !== undefined){
                        const line = chunk.choices[0].delta.content ;
                        fullResponse+=line;
                        await fetchMutation(api.messages.update,{
                            messageId: newAssistantMessageId,
                            content: fullResponse
                        });
                    }
                }
            }
        }
        // coze
        else {
            const response = await sendMsgByCoze(formattedMessages);
            const stream = await response;
            console.log('请求结束-----------------',stream);
            
            if(stream) {
                // 保存回答的消息
                const newAssistantMessageId = await fetchMutation(api.messages.send, {
                    role: "assistant",
                    content: '',
                    chatId: args.chatId
                });
                // 处理流式响应
                let fullResponse = '';
                for await (const chatData of stream) {
                    // 检查信号是否中止, 如果点击暂停，则取消渲染，直接丢弃后续的数据块即可。 
                    if (signal.aborted) {
                        console.log('请求已中止，停止处理流式响应');
                        break;
                    }
                    if (chatData.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
                        const line = chatData.data.content;
                        fullResponse+=line;
                        await fetchMutation(api.messages.update,{
                            messageId: newAssistantMessageId,
                            content: fullResponse
                        });
                    } else if (chatData.event === ChatEventType.ERROR) {
                        console.error('Chat error:', chatData.data);
                    }
                } 
            }
        }
        
        
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
  }
  


async function parse_files(files: FormattedFile[]) {
    const messages:MessageType[] = [];
    // 对每个文件路径，我们都会抽取文件内容，最后生成一个 role 为 system 的 message，并加入
    // 到最终返回的 messages 列表中。
    for (const file of files) {
        // const response = await fetch(`../moonshot/files?key=${file.key}`)
        const fileContent = await parse_files_content(file.key); 
        console.log('接收-----------',fileContent);
        
        messages.push({
            role: "system",
            content: fileContent as unknown as string,
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