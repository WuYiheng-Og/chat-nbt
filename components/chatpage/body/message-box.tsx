import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "./markdown";
import { Doc } from "@/convex/_generated/dataModel";
import AttachmentDisplay from "@/components/files/AttachmentDisplay";
import React from "react";
import { GPTModel } from "@/lib/types";
import { LoaderCircle, CopyIcon, RefreshCwIcon } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; // 导入 toast 和 ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // 导入样式

interface MessageBoxProps {
    message: Doc<"messages">;
    userImageUrl?: string;
    model?: string;
    onRegenerate?: (messageId: string) => void; // 用于触发重新生成的回调函数
}

function MessageBox ({
                         message,
                         userImageUrl,
                         model,
                         onRegenerate
                     }: MessageBoxProps) {

    if (message.role === "system") {
        return null;
    }

    const nameString = message.role === "user" ? "You" : (model === GPTModel.KIMI ? "TalkKimi" : "TalkCoze");
    const imageUrl = message.role === "user" ? userImageUrl : (model === GPTModel.KIMI ? '/kimi_log.svg' : '/coze_log.svg');
    const hasAttachments = message.attachmentMetaInfoList && message.attachmentMetaInfoList.length > 0;

    const handleCopyClick = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            toast.success('内容已复制到剪贴板', {
                position: "top-center", // 使用字符串字面量
                autoClose: 2000 // 2秒后自动关闭
            });
        }).catch(err => {
            console.error('复制失败:', err);
            toast.error('复制失败，请重试', {
                position: "top-center", // 使用字符串字面量
                autoClose: 2000
            });
        });
    };

    const handleRegenerateClick = () => {
        if (onRegenerate) {
            onRegenerate(message._id); // 触发重新生成，并传递消息ID
        }
    };

    return (
        <>
            <div className={`flex pb-8 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="w-7 h-7 text-white fill-white">
                    <AvatarImage src={imageUrl} className="text-white fill-white" />
                    <AvatarFallback className="text-neutral-900 font-semibold">
                        {nameString[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[calc(80%)] px-2 relative">
                    <h3 className={`font-bold text-white ${message.role === "user" ? "text-end" : "text-start"}`}>{nameString}</h3>
                    <div style={{
                        border: '1px solid gray',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        {message.role !== "user" && message.content === "" && (
                            <div className="flex justify-center items-center">
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                            </div>
                        )}
                        <div className={`flex flex-grow flex-col gap-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
                            <Markdown content={message.content} role={message.role}/>
                            {hasAttachments && (
                                <AttachmentDisplay attachmentMetaInfoList={message.attachmentMetaInfoList}/>
                            )}
                        </div>
                        {/* 复制和重新生成按钮 */}
                        <div className="mt-2 flex justify-between">
                            <button onClick={() => handleCopyClick(message.content)} title="点击复制内容" className="bg-transparent text-white hover:text-gray-400 focus:outline-none">
                                <CopyIcon size={20} />
                            </button>
                            {message.role !== "user" && (
                                <button onClick={handleRegenerateClick} title="点击重新生成" className="bg-transparent text-white hover:text-gray-400 focus:outline-none">
                                    <RefreshCwIcon size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer /> {/* 添加 ToastContainer 以显示通知 */}
        </>
    )
};

// 自定义比较函数
const arePropsEqual = (prevProps: MessageBoxProps, nextProps: MessageBoxProps ) => {
    if(nextProps.message.role === 'user') return true;
    return (
        prevProps.message._id === nextProps.message._id &&
        prevProps.message.content === nextProps.message.content &&
        prevProps.model === nextProps.model
    )
};

// 使用 React.memo 包裹 MessageBox 组件【减少不必要的渲染】
const MemoizedMessageBox = React.memo(MessageBox, arePropsEqual );

export { MemoizedMessageBox as MessageBox };
