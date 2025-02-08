import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        tokenIdentifier: v.string(),
        model: v.union(v.literal("gpt-3.5-turbo-1106"), v.literal
            ("gpt-4-0125-preview")),
        endsOn: v.optional(v.number()),// 用户订阅结束的时间 
        subscriptionId: v.optional(v.string())
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_subscriptionId", ["subscriptionId"]),
    chats: defineTable({
        userId: v.id("users"),//引用 users 表中记录的 ID 字段，在 Convex 数据库里，每个表都会自动拥有一个名为 _id 的字段，所以即便你在定义 users 表时没有显式地写出 id 字段，实际上表中是存在这个隐式的唯一标识符的。
        title: v.string(),
    })
        .index("by_userId", ["userId"]),
    messages: defineTable({
        role: v.union(
            v.literal("user"),
            v.literal("assistant"),
            v.literal('system')
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
        // 可选，附件元信息
        attachmentMetaInfoList: v.optional(v.array(v.object({
            key: v.string(), // 用来索引文件获取url的
            type: v.string(),
            name: v.string(),
            size: v.number(),
        })))
    })
        .index("by_chatId", ["chatId"]), 
})

