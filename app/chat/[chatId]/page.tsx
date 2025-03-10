"use client";

import { SendPendingProvider } from "@/app/context/ChatContext";
import { Body } from "@/components/chatpage/body";
import { Form } from "@/components/chatpage/form";
import { Header } from "@/components/chatpage/header";
import { SearchCommand } from "@/components/chatpage/inlinedialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LoaderCircle } from 'lucide-react';
import { useRouter } from "next/navigation";
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
    const messages = useQuery(api.messages.list, { chatId });
    const router = useRouter();
    const updateTitile = useMutation(api.chats.rename);



    useEffect(() => {
        if (chat === null) {
            router.push("/");
        }
    }, [chat, router]);

    useEffect(() => {
        // 定义并立即执行一个异步函数
        (async () => {
            if (messages && messages.length === 1) {
                const firstMessage = messages[0];
                const question = firstMessage.content; // 假设消息内容就是问题
                console.log('获取到第一条信息，修改会话标题----------', question);

                try {
                    // 调用 API 更新聊天标题
                    await updateTitile({
                        id: chatId,
                        title: question
                    });

                } catch (error) {
                    console.error('Failed to update title:', error);
                }
            }
        })();
    }, [messages, chatId]);

    return (
        <SendPendingProvider>
            <div className="bg-neutral-800 w-full h-full flex flex-col">
                <Header />
                <SearchCommand chatId={chatId} />
                {messages === undefined ? (
                    <div className="flex flex-col h-[calc(100vh-60px)] items-center">
                        <div className="pt-52">
                            <LoaderCircle className="w-16 h-16 animate-spin" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(100vh-60px)]">
                        {messages?.length === 0 ? (
                            <div className="mx-auto flex flex-col items-center w-full pt-52">
                                <h2 className="text-xl md:text-3xl font-semibold text-white px-2">
                                    准备好提问了吗？我随时可以开始哦！
                                </h2>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <Body chatId={chatId} />
                            </div>
                        )}
                        <div className="w-full bg-neutral-800 pt-4">
                            <Form chatId={chatId} />
                            <div className="flex w-full items-center justify-center pt-2 pb-4">
                                <p className="w-full text-center text-xs text-neutral-400">
                                    内容由 AI 生成，请仔细甄别
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SendPendingProvider>
    )


}

export default Chat;
