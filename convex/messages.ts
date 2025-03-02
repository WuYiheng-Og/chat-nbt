import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api"
 
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

// 执行数据库操作，将message数据插入db（内部使用）
export const send = mutation({
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


export const retrieve = query({
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


export const update = mutation({
    args: { messageId: v.id("messages"), content: v.string() },
    handler: async (ctx, args) => {
        // patch 局部更新
        await ctx.db.patch(args.messageId, {
            content: args.content
        })
    }
})
