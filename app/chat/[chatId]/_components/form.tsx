import { AttachmentPreview } from "@/components/file/AttachmentPreview";
import { FileUpload } from "@/components/file/FileUpload";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { CircleStop, Send } from "lucide-react";
import {  useState } from "react"; 
// 文件元数据
type FormattedFile = {
    key: string,// 通过key可以索引url
    name: string,
    type: string,
    size:number,
}
interface FormProps {
    chatId: Id<"chats">;
}
// 输入框，与大模型对话请求对接。
export const Form = ({ chatId }: FormProps) => {
    const chat = useQuery(api.chats.get, { id: chatId });
    const sendMessage = useAction(api.messages.submit);

    const [message, setMessage] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentMetaInfoList, setAttachmentMetaInfoList] = useState<FormattedFile[]>([]);// 文件元数据
    const [uploadPending, setUploadPending] = useState(false);// true表示正在上传，否则不在上传 
    const [sendPending, setSendPending] = useState(false);// true表示正在生成回答
    if (chat === undefined) {
        return null;
    }
    if (chat === null) {
        return <div>Chat not found!</div>
    }

    // 设置文件加载状态
    const handleFileUploading = (uploadPending:boolean, attachmentMetaInfoList: FormattedFile[])=> {
        setUploadPending(uploadPending);
        if(attachmentMetaInfoList.length==0) return;
        setAttachmentMetaInfoList(prev=>[...prev, ...attachmentMetaInfoList]);
        // console.log('文件元数据获取：',attachmentMetaInfoList);
        
    }

    // 选择文件后，将文件传递给父组件
    const handleFileSelect = (files: File[]) => { 
        setAttachments(prev => [...prev, ...files]); 
    };

    // 删除上传的文件
    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async () => {
        if (message === "") return;
        const temp = message;
        setMessage("");
        setSendPending(true); // 开始发送消息，设置 sendPending 为 true
        await sendMessage({
            role: "user",
            content: temp,
            chatId: chat._id,
            attachmentMetaInfoList: attachmentMetaInfoList
        });
        setSendPending(false); // 消息发送完成，设置 sendPending 为 false
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (uploadPending) return;
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    }
 
    return (
        <div className="flex flex-col w-full">
            <AttachmentPreview 
                isUploading={uploadPending}
                attachments={attachments}
                onRemove={handleRemoveAttachment}
            />
            <div className="relative sm:px-12 md:px-52 lg:pr-[500px] 2xl:px-96 w-full bg-neutral-800 flex items-center">
            <Input
                placeholder="Message TalkGPT..."
                className="border-[1px] border-neutral-500 ring-none rounded-xl bg-inherit text-neutral-200 placeholder:text-neutral-400 h-12"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
            /> 
            <div className="relative right-16 flex items-center gap-x-2">
            <FileUpload onFileSelect={handleFileSelect} onFileUploading={handleFileUploading} />
                    {sendPending? (
                        <CircleStop className="w-5 h-5 cursor-pointer"/>

                    ): (
                        <Send  
                        className={`w-5 h-5 cursor-pointer ${uploadPending? 'opacity-50 cursor-not-allowed' : 'hover:text-neutral-300'}`}
                        onClick={handleSendMessage}
                    />
                    )} 
                </div>
            </div>
        </div>


    )
}