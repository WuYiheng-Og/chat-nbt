import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// 执行对chats表格的crud数据库操作
export const create = mutation({
    args: {},
    handler: async (ctx) => {
        // 异步获取用户身份信息，若未获得，提示用户未登录
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        // 查询用户信息，通过user的token查取users表。
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user === null) {
            return null;
        }

        // 创建新的聊天记录
        const chatId = await ctx.db.insert("chats", {
            userId: user._id,
            title: "New chat"
        });

        return chatId;
    }
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called create chat without logged in user!");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user === null) {
            throw Error("User not found!");
        }

        return ctx.db
            .query("chats")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
    }
})

export const rename = mutation({
    args: { id: v.id("chats"), title: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            title: args.title
        })
    }
})

export const remove = mutation({
    args: { id: v.id("chats") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    }
})

export const get = query({
    args: { id: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
})