import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "./markdown";
import { Doc } from "@/convex/_generated/dataModel";
import AttachmentDisplay from "@/components/file/AttachmentDisplay";
import React from "react";

interface MessageBoxProps {
    message: Doc<"messages">;
    userImageUrl?: string;
}

export const MessageBox = React.memo(({
    message,
    userImageUrl
}: MessageBoxProps) => {
    
    // 如果 role 是 system，直接返回 null，不渲染
    if (message.role === "system") {
        return null;
    }
    
    const nameString = message.role === "user" ? "You" : "TalkGPT";
    const imageUrl = message.role === "user" ? userImageUrl : "/logo.svg";
    const hasAttachments = message.attachmentMetaInfoList && message.attachmentMetaInfoList.length > 0;

    return (
        <div
            className="flex space-x-3 items-start mb-10 max-w-[calc(80%)] md:max-w-full text-wrap"
        >
            <Avatar className="w-7 h-7 text-white fill-white">
                <AvatarImage src={imageUrl} className="text-white fill-white" />
                <AvatarFallback className="text-neutral-900 font-semibold">
                    {nameString[0]}
                </AvatarFallback>
            </Avatar>
            <div className="max-w-[calc(80%)]">
                <h3 className="font-bold">{nameString}</h3>
                <div className="flex flex-grow flex-col gap-3 gap-y-5">
                    <Markdown content={message.content} />
                    {/* TODO 预览下面的图 */}
                    {hasAttachments && (
                        <AttachmentDisplay attachmentMetaInfoList={message.attachmentMetaInfoList}/>
                    )}
                </div>
            </div>
        </div>
    )
});