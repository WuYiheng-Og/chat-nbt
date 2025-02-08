import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
    args: {},
    handler: async (ctx) => {

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storedUser without authenticated usr");
        }

        // check if user is already stored
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        // 用户已经注册
        if (user !== null) {
            // 获取用户的聊天列表
            const chat = await ctx.db
                .query("chats")
                .withIndex("by_userId", q =>
                    q.eq("userId", user._id))
                .first();

            // 如果没有聊天记录，为其创建一个聊天
            if (chat === null) {
                const chatId = await ctx.db.insert("chats", {
                    userId: user._id,
                    title: "New Chat"
                });
                return chatId;
            }
            return chat._id;
        }

        const userId = await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            model: "gpt-3.5-turbo-1106"
        });

        const chatId = await ctx.db.insert("chats", {
            userId,
            title: "New Chat"
        });

        return chatId;
    }
})

export const selectGPT = mutation({
    args: {
        model: v.union(v.literal("gpt-3.5-turbo-1106"),
            v.literal("gpt-4-0125-preview"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storedUser without authenticated usr");
        }
        // check if user is already stored
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user === null) {
            throw new Error("User not found");
        }
        await ctx.db.patch(user._id, { model: args.model });
        return user._id;
    }
})

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storedUser without authenticated usr");
        }
        // check if user is already stored
        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
    }
})