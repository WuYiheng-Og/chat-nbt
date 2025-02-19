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

export const Body = ({ chatId }: BodyProps) => {
    const messages = useQuery(api.messages.list, { chatId }) || [];
    const { user } = useUser(); // 从clerk获取的
    const curUser = useQuery(api.users.currentUser, {}); // 数据库存储的
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "auto" });
        }
    }
    return (
        <>
            <ScrollArea
                className="max-h-[calc(100%-150px)] h-full w-full flex-1"
            >
                <div className="px-2 sm:px-12 md:px-36 2xl:px-72 w-full items-center justify-center">
                    {messages.map((message) => (
                        <MessageBox
                            key={message._id}
                            message={message}
                            userImageUrl={user?.imageUrl}
                            model={curUser?.model}
                        />
                    ))}
                </div>
                <div ref={scrollRef} />
            </ScrollArea>
        </>
    )
}