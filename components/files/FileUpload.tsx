import { Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { GPTModel } from "@/lib/types";

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    onFileUploading: (uploadPending: boolean, attachmentMetaInfo: FormattedFile[]) => void;
    model: string;
    sendPending: boolean; // 外部传入状态
}
// 文件元数据
type FormattedFile = {
    key: string, // 通过key可以索引url
    name: string,
    type: string,
    size: number,
};

export const FileUpload = ({ onFileSelect, onFileUploading, model, sendPending }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        if (!isUploading &&!sendPending) {
            fileInputRef.current?.click();
        }
    };

    // 选择文件，将文件传递给父组件
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setIsUploading(true);
        onFileUploading(true, []); // 开始加载
        onFileSelect(files); // 把文件传给父组件

        // 正式上传
        const formData = new FormData();
        files.forEach((file) => {
            formData.append(`file`, file);
        });
        const GPTVersion = model === GPTModel.KIMI? "moonshot" : "coze";
        const response = await fetch(`/api/${GPTVersion}/files`, {
            method: "POST",
            body: formData
        });

        const res = await response.json();
        setIsUploading(false);
        onFileUploading(false, res.formatFiles); // 结束加载

    };
    const isDisabled = isUploading || sendPending;

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
            />
            <Paperclip
                className={`w-5 h-5 ${isDisabled? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-neutral-300'}`}
                onClick={isDisabled? undefined : handleUpload}
            />
        </>
    );
};