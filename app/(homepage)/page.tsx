"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/chatpage/header";

const Homepage = () => {
    const storeUser = useMutation(api.users.store);
    const router = useRouter();
    useEffect(() => {
        const fetch = async () => {
            const chatId = await storeUser({});
            router.push(`/chat/${chatId}`)
        }
        fetch();
    }, [storeUser, router])
    return (
        <div className="bg-neutral-800 w-full h-full flex flex-col">
            <Header />
            <div className="flex flex-col h-[calc(100vh-60px)] items-center">
                <div className="pt-52">
                    <LoaderCircle className="w-16 h-16 animate-spin" />
                </div>
            </div>
        </div>
    )
}

export default Homepage;
