"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/chatpage/header";
import { Body } from "@/components/chatpage/body";
import { Form } from "@/components/chatpage/form";
import React, { useEffect } from "react";

interface ChatPageProps {
    // 新版的nextjs传入动态路由的参数是一个promise类型
    params: Promise<{
        chatId: Id<"chats">;
    }>
}

const Chat = ({ params }: ChatPageProps) => {
    const resolvedParams = React.use(params);
    const chatId = resolvedParams?.chatId;
    const chat = useQuery(api.chats.get, { id: chatId });
    const messages = useQuery(api.messages.list, { chatId }) || [];
    const router = useRouter();

    useEffect(() => {
        if (chat === null) {
            router.push("/");
        }
    }, [chat, router]);

    if (chat === null) {
        return null;
    }

    console.log(messages?.length)

    return (
        <div className="bg-neutral-800 w-full h-full flex flex-col">
            <Header />
            {messages?.length === 0 ? (
                <div className="mx-auto flex flex-col gap-5 items-center w-full pt-52">
                    <h2 className="text-xl md:text-3xl font-semibold text-white px-2">
                        What Can I do for You ?
                    </h2>
                    <div className="w-full bg-neutral-800 pt-4">
                        <Form chatId={chatId} />
                        <div className="flex w-full items-center justify-center pt-4">
                            <p className="w-full text-center text-xs text-neutral-400">
                                内容由 AI 生成，请仔细甄别
                            </p>
                        </div>
                    </div>
                </div>
                ):(
                <div className="flex flex-col h-[calc(100vh-60px)]"> {/* 调整容器高度 */}
                    <div className="flex-1 overflow-y-auto">
                        <Body chatId={chatId} />
                    </div>
                    <div className="w-full bg-neutral-800 pt-4"> {/* 移除 fixed 定位 */}
                        <Form chatId={chatId} />
                        <div className="flex w-full items-center justify-center pt-2">
                            <p className="w-full text-center text-xs text-neutral-400">
                                内容由 AI 生成，请仔细甄别
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat;
