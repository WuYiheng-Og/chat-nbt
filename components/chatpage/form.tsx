import { AttachmentPreview } from "@/components/files/AttachmentPreview";
import { FileUpload } from "@/components/files/FileUpload";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { CircleStop, Send } from "lucide-react";
import {  useRef, useState } from "react";
import { useSendPending } from "@/app/context/ChatContext";
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
    const user = useQuery(api.users.currentUser, {});

    const [message, setMessage] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentMetaInfoList, setAttachmentMetaInfoList] = useState<FormattedFile[]>([]);// 文件元数据
    const [uploadPending, setUploadPending] = useState(false);// true表示正在上传，否则不在上传
    //const [sendPending, setSendPending] = useState(false);// true表示正在生成回答
    // 全局共享 true表示正在生成回答
    const {sendPending, setSendPending} = useSendPending();

    // 用于终止聊天
    const abortControllerRef = useRef<AbortController | null>(null);

    // 设置文件加载状态
    const handleFileUploading = (uploadPending:boolean, attachmentMetaInfoList: FormattedFile[])=> {
        setUploadPending(uploadPending);
        if(attachmentMetaInfoList.length==0) return;
        setAttachmentMetaInfoList(()=>[...attachmentMetaInfoList]);
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

    // 发送消息给大语言模型
    const handleSendMessage = async () => {

        if (message === "") return;
        const temp = message;
        setMessage("");
        setSendPending(true); // 开始发送消息，设置 sendPending 为 true
        console.log('开始发送',sendPending);


        // 创建 AbortController 实例
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        console.log('发送消息！');

        // await sendMessage({
        //     role: "user",
        //     content: temp,
        //     chatId: chat._id,
        //     attachmentMetaInfoList: attachmentMetaInfoList,
        //     curUser: user!
        // }, abortController.signal);
        fetch('/api/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: "user",
                content: temp,
                chatId: chat?._id,
                attachmentMetaInfoList: attachmentMetaInfoList,
                curUser: user!
            }),
            signal: abortController.signal
        })
           .then(response => response.json())
           .then(data => {
                if (data.success) {
                    // console.log('请求成功:');
                    setSendPending(false); // 消息发送完成，设置 sendPending 为 false
                } else {
                    console.error('请求失败:', data.error);
                }
            })
           .catch(error => {
                // 如果是中止错误，不抛出异常
                if (error.name === 'AbortError') {
                    // console.log('请求已中止');
                }
                else {
                    console.error('发生错误:', error);
                }
            });
    }

    // 中断流式传输
    const stopStream = () => {

        if (abortControllerRef.current) {
            // 调用 abort 方法中断请求
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            console.log('中断流式传输！！！');

            setSendPending(false);// 消息发送完成，设置 sendPending 为 false
        }
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
            <div className="px-2 sm:px-12 md:px-36 2xl:px-72 w-full items-center justify-center">
                <div className="border-[2px] border-neutral-500 rounded-xl flex items-center justify-center hover:border-white/80">
                    <Input
                        placeholder="发送消息或者上传附件..."
                        className="bg-inherit text-neutral-200 placeholder:text-neutral-400 h-12 focus:outline-none"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-x-2 pr-2">
                        <FileUpload onFileSelect={handleFileSelect} onFileUploading={handleFileUploading} model={user?user.model: 'kimi'} sendPending={sendPending}/>
                        {sendPending? (
                            <CircleStop className="w-5 h-5 cursor-pointer" onClick={stopStream}/>

                        ): (
                            <Send
                            className={`w-5 h-5 cursor-pointer ${uploadPending? 'opacity-50 cursor-not-allowed' : 'hover:text-neutral-300'}`}
                            onClick={uploadPending? undefined : handleSendMessage}
                        />
                        )}
                    </div>
                </div>
            </div>
        </div>


    )
}
