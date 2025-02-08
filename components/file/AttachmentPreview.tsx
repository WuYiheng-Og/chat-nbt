import { FileText, X } from "lucide-react";
 
interface AttachmentPreviewProps {
    isUploading: boolean,
    attachments: File[];
    onRemove: (index: number) => void;
} 
export const AttachmentPreview = ({ 
    isUploading,
    attachments,
    onRemove 
}: AttachmentPreviewProps) => {
    if (attachments.length === 0) return null; 

    const formatFileSize = (size: number) => {
        if (size < 1024) {
            return `${size} B`;
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
    };


    return (
        <div className="flex flex-wrap gap-2 p-2 sm:px-12 md:px-52 lg:pr-[500px] 2xl:px-96 bg-neutral-800">
            {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-neutral-700 rounded-md p-2">
                    {/* 加载动画 */}
                    {isUploading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-200"></div>
                    )}
                    {file.type.startsWith('image/')? (
                        <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded-md"
                        />
                    ) : (
                        <FileText className="w-8 h-8 text-neutral-200" /> 
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm text-neutral-200">{file.name}</span>
                        <span className="text-xs text-neutral-400">{formatFileSize(file.size)}</span>
                    </div>
                    {!isUploading && (
                        <X
                            className="w-4 h-4 cursor-pointer hover:text-red-500"
                            onClick={() => onRemove(index)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};