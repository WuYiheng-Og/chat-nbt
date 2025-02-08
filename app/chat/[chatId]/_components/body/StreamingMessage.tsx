import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "./markdown";
// 这个组件用于渲染当前正在生成的消息内容 
interface StreamingMessageProps {
    content: string;
    userImageUrl?: string;
}

export const StreamingMessage = ({
    content,
    userImageUrl
}: StreamingMessageProps) => {
    const nameString = "TalkGPT";
    const imageUrl = "/logo.svg";

    return (
        <div className="flex space-x-3 items-start mb-10 max-w-[calc(80%)] md:max-w-full text-wrap">
            <Avatar className="w-7 h-7 text-white fill-white">
                <AvatarImage src={imageUrl} className="text-white fill-white" />
                <AvatarFallback className="text-neutral-900 font-semibold">
                    {nameString[0]}
                </AvatarFallback>
            </Avatar>
            <div className="max-w-[calc(80%)]">
                <h3 className="font-bold">{nameString}</h3>
                <div className="flex flex-grow flex-col gap-3 gap-y-5">
                    <Markdown content={content} />
                </div>
            </div>
        </div>
    );
};