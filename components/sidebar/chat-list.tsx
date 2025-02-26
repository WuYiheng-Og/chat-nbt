"use client"

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation';
import { ChatBox } from './chat-box';
import { LoaderCircle } from 'lucide-react';

export const ChatList = () => {
    // 获取聊天列表数据
    const chats = useQuery(api.chats.list) || [];

    // 获取路由参数
    const params = useParams<{ chatId: Id<"chats"> }>();
    
    // 安全地获取 chatId，如果 params 为 null 则 chatId 为 undefined
    const chatId = params?.chatId;

    if (chats === undefined) {
        return (
        <div className="flex flex-col h-[calc(100vh-60px)] items-center">
            <div className="pt-52">
                <LoaderCircle className="w-16 h-16 animate-spin" />
            </div>
        </div>
        )
    }

    return (
        <div className='flex flex-col flex-1 overflow-y-auto'>
            {chats.map((chat) => (
                <ChatBox
                    key={chat._id}
                    chat={chat}
                    selected={chat._id === chatId} />
            ))}
        </div>
    )
}