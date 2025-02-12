import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { MessageBox } from "./message-box";
import React from "react";

interface BodyProps {
    chatId: Id<"chats">;
}

export const Body = ({ chatId }: BodyProps) => {
    // 使用 useMemo 包裹 messages 的初始化
    const messages = useMemo(() => {
        return useQuery(api.messages.list, { chatId }) || [];
    }, [chatId]);
    const { user } = useUser();
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
                <div className="px-4 sm:px-12 md:px-52 2xl:px-[230px] relative">
                    {messages.map((message) => (
                        <MessageBox
                            key={message._id}
                            message={message}
                            userImageUrl={user?.imageUrl}
                        />
                    ))}
                </div>
                <div ref={scrollRef} />
            </ScrollArea>
        </>
    )
}