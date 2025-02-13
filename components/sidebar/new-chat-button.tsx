"use client";

import { PlusCircle, SquarePen } from "lucide-react"
import { Button } from "../ui/button"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";


export const NewChatButton = () => {
    const router = useRouter();
    const create = useMutation(api.chats.create);

    const handleAdd = async() => {
        const chatId = await create({});
        if(chatId){
            // 跳转至新的聊天界面
            router.push(`/chat/${chatId}`);
        }

    }
    return (
        <Button className="w-full flex justify-start items-center bg-inherit hover:bg-inherit p-0"
            onClick={handleAdd}>
            <PlusCircle className="w-5 h-5" />
            <p className="font-semibold text-start ml-3">New Chat</p>
            <SquarePen className="w-4 h-4 ml-auto" />
        </Button>
    )
}