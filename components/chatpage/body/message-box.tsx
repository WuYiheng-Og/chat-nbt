import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "./markdown";
import { Doc } from "@/convex/_generated/dataModel";
import AttachmentDisplay from "@/components/files/AttachmentDisplay";
import React from "react";
import { GPTModel } from "@/lib/types";
import { LoaderCircle } from 'lucide-react';

interface MessageBoxProps {
    message: Doc<"messages">;
    userImageUrl?: string; 
    model?: string;
}

function MessageBox ({
    message,
    userImageUrl,
    model
}: MessageBoxProps) {
    
    // 如果 role 是 system，直接返回 null，不渲染
    if (message.role === "system") {
        return null;
    } 

    const nameString = message.role === "user" ? "You" : "TalkGPT";
    const imageUrl = message.role === "user" ? userImageUrl : (model===GPTModel.KIMI?'/kimi_log.svg':'/coze_log.svg');
    const hasAttachments = message.attachmentMetaInfoList && message.attachmentMetaInfoList.length > 0; 
    return (
        <div className={`flex pb-8 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <Avatar className="w-7 h-7 text-white fill-white">
                <AvatarImage src={imageUrl} className="text-white fill-white" />
                <AvatarFallback className="text-neutral-900 font-semibold">
                    {nameString[0]}
                </AvatarFallback>
            </Avatar>
            <div className="max-w-[calc(80%)] px-2">
                <h3 className={`font-bold ${message.role === "user" ? "text-end" : "text-start"}`}>{nameString}</h3>
                {message.role!=="user"&&message.content==="" && (<div>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                </div>)}
                <div className={`flex flex-grow flex-col gap-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <Markdown content={message.content} role={message.role}/> 
                    {hasAttachments && (
                        <AttachmentDisplay attachmentMetaInfoList={message.attachmentMetaInfoList}/>
                    )}
                </div>
            </div>
        </div>
    )
};

// 自定义比较函数
const arePropsEqual = (prevProps: MessageBoxProps, nextProps: MessageBoxProps ) => {
    // 用户的肯定不再次渲染了
    if(nextProps.message.role==='user') return true;
    return (
        
        prevProps.message._id === nextProps.message._id &&
        prevProps.message.content === nextProps.message.content &&
        prevProps.model === nextProps.model
    )
};
// 使用 React.memo 包裹 MessageBox 组件【减少不必要的渲染】
const MemoizedMessageBox = React.memo(MessageBox, arePropsEqual );

export { MemoizedMessageBox as MessageBox };