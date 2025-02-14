"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Header } from "./_components/header";
import { Body } from "./_components/body";
import { Form } from "./_components/form";
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
    const router = useRouter();

    useEffect(() => {
        if (chat === null) {
            router.push("/");
        }
    }, [chat, router]);

    if (chat === null) {
        return null;
    }

    return (
        <div className="bg-neutral-800 w-full h-full flex flex-col">
            <Header />
            <div className="flex flex-col h-[calc(100vh-60px)]"> {/* 调整容器高度 */}
                <div className="flex-1 overflow-y-auto">
                    <Body chatId={chatId} />
                </div>
                <div className="w-full bg-neutral-800 pt-4"> {/* 移除 fixed 定位 */}
                    <Form chatId={chatId} />
                    <p className="w-full text-center text-xs text-neutral-400 my-2 lg:pr-[300px]">
                        内容由 AI 生成，请仔细甄别
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Chat;
