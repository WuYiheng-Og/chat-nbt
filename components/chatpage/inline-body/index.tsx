import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { MessageBox } from "./message-box";
import React from "react";

interface BodyProps {
    chatId: Id<"chats">;
}

export const InlineBody = ({ chatId }: BodyProps) => {
    const messages = useQuery(api.messages.list, { chatId }) || [];
    const { user } = useUser(); // 从clerk获取的
    const curUser = useQuery(api.users.currentUser, {}); // 数据库存储的
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 确保滚动到底部
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    }, [messages]);

    return (
        <ScrollArea className="h-5/6 w-full pr-1">
            <div className="w-11/12 h-96 flex flex-col">
                {messages.map((message, index) => (
                    <div
                        key={message._id}
                        ref={index === messages.length - 1 ? scrollRef : null} // ✅ 绑定到 div
                    >
                        <MessageBox
                            message={message}
                            userImageUrl={user?.imageUrl}
                            model={curUser?.model}
                        />
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};
