import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api"
import OpenAI from 'openai';

// 这里使用kimi的
const kimiClient = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY, // 在这里将 MOONSHOT_API_KEY 替换为你从 Kimi 开放平台申请的 API Key
    baseURL: process.env.MOONSHOT_API_URL,
})
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

// 获取消息列表，根据聊天id获取。
export const list = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db.query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .collect();
    }
})

// 执行数据库操作，将message数据插入db
export const send = internalMutation({
    args: {
        role:
            v.union(
                v.literal("user"),
                v.literal("assistant"),
                v.literal("system")
            ),
        content: v.string(),
        chatId: v.id("chats"),
        // 可选，附件元信息
        attachmentMetaInfo: v.optional(v.object({
            key: v.string(), // 用来索引文件获取url的
            type: v.string(),
            name: v.string(),
            size: v.number(),
        })),
        // 可选，附件元信息列表
        attachmentMetaInfoList: v.optional(v.array(v.object({
            key: v.string(), // 用来索引文件获取url的
            type: v.string(),
            name: v.string(),
            size: v.number(),
        })))
    },
    handler: async (ctx, args) => {
        const newMessageId = await ctx.db.insert("messages", {
            role: args.role,
            content: args.content,
            chatId: args.chatId,
            attachmentMetaInfo: args.attachmentMetaInfo,
            attachmentMetaInfoList: args.attachmentMetaInfoList
        });
        return newMessageId;
    }
})

export const retrieve = internalQuery({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .order("desc")
            .take(5);

        return messages;
    }
})

async function parse_files(files: FormattedFile[]) {
    const messages:MessageType[] = [];
    // 对每个文件路径，我们都会抽取文件内容，最后生成一个 role 为 system 的 message，并加入
    // 到最终返回的 messages 列表中。
    for (const file of files) {
        let file_content = await (await kimiClient.files.content(file.key)).text()
        console.log('解析文件内容：',file_content);
        
        messages.push({
            role: "system",
            content: file_content,
            metaInfo: file
        })
    } 
    return messages
}

// 动作函数，首先验证用户是否存在，然后再调用send发送消息执行数据库操作。【逻辑和操作分离，提高可维护性】
export const submit = action({
    args: {
        role:
            v.union(
                v.literal("user"),
                v.literal("assistant"),
                v.literal("system")
            ),
        content: v.string(),
        chatId: v.id("chats"),
        // 可选，附件元信息
        attachmentMetaInfoList: v.optional(v.array(v.object({
            key: v.string(), // 用来索引文件获取url的
            type: v.string(),
            name: v.string(),
            size: v.number(),
        })))

    },
    handler: async (ctx, args) => {
        const currentUser = await ctx.runQuery(api.users.currentUser, {});
        if (currentUser === null) {
            throw new Error("User not found");
        }
        // 存在附件
        if(args.attachmentMetaInfoList) {
            // 解析文件内容
            const fileMessages = await parse_files(args.attachmentMetaInfoList);
            for (const message of fileMessages) {
                // send user message 执行数据库操作,信息存入数据库
                await ctx.runMutation(internal.messages.send, {
                    role: message.role,
                    content: message.content,
                    chatId: args.chatId,
                    attachmentMetaInfo: message.metaInfo
                })
            }
        }
        
        // send user message 执行数据库操作,信息存入数据库
        await ctx.runMutation(internal.messages.send, {
            role: args.role,
            content: args.content,
            chatId: args.chatId,
            attachmentMetaInfoList: args.attachmentMetaInfoList 
        })

        const messages = await ctx.runQuery(internal.messages.retrieve, {
            chatId: args.chatId
        })

        messages.reverse();

        const formattedMessages = messages.map(message => ({
            role: message.role,
            content: message.content
        })); 

        let response = '';

        const stream = await kimiClient.chat.completions.create({
            model: 'moonshot-v1-8k',
            stream: true,
            messages: formattedMessages,
            temperature: 0.3,
        })

        // save message from openai 
        const newAssistantMessageId = await ctx.runMutation(internal.messages.send, {
            role: "assistant",
            content: '',
            chatId: args.chatId
        });

        for await (const part of stream) {
            if (part.choices[0].delta.content === null) {
                throw Error("OpenAI completion is null");
            }

            if (part.choices[0].delta.content !== undefined) {
                response += part.choices[0].delta.content;
                await ctx.runMutation(internal.messages.update, {
                    messageId: newAssistantMessageId,
                    content: response
                })
            }
        }
    }
});

export const update = internalMutation({
    args: { messageId: v.id("messages"), content: v.string() },
    handler: async (ctx, args) => {
        // patch 局部更新
        await ctx.db.patch(args.messageId, {
            content: args.content
        })
    }
})
