import { Paperclip } from "lucide-react";
import { useRef } from "react";

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    onFileUploading: (uploadPending: boolean, attachmentMetaInfo: FormattedFile[])=> void;
} 
// 文件元数据
type FormattedFile = {
    key: string,// 通过key可以索引url
    name: string,
    type: string,
    size:number,
}
export const FileUpload = ({ onFileSelect, onFileUploading }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    // 选择文件，将文件传递给父组件
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        console.log('接收文件：',files);
        // TODO 上传文件到Moonshot，让其解析（此处获取文件的id，后面通过id索引文件内容）
        onFileUploading(true, []);// 开始加载
        onFileSelect(files); // 把文件传给父组件

        console.log('开始上传文件到Moonshot:'); 
        // 模拟文件上传和解析
        // setTimeout(()=>{
        //     console.log('文件上传完成');
        //     onFileUploading(false);// 结束加载
        // },2000)
        
        // 正式上传 
        console.log('上传文件给api', files);
        // 将file存入formData，以便序列化传入。因为File类型是二进制文件，无法直接序列化
        const formData = new FormData();
        files.forEach((file, index) => formData.append(`${index}`, file) );
        
        const response = await fetch("/api/moonshot/files", {
            method: "POST", 
            body: formData
          })
    
          const res = await response.json()
          console.log('上传完成，结束加载，formatFiles',res.formatFiles);
          // 将文件传递给父组件
          
        onFileUploading(false, res.formatFiles);// 结束加载
    };

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
                className="w-5 h-5 cursor-pointer hover:text-neutral-300" 
                onClick={handleUpload}
            />
        </>
    );
};