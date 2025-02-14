import React, { useEffect, useState } from 'react'; 

// 定义附件元信息的类型
type FormattedFile = {
    key: string; // 用来索引文件获取url的
    type: string;
    name: string;
    size: number;
};

// 新的附件显示组件
interface AttachmentDisplayProps {
    attachmentMetaInfoList?: FormattedFile[];
} 
const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
};

const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({ attachmentMetaInfoList }) => { 
    
    const [presignedUrls, setPresignedUrls] = useState<{ [key: string]: string }>({});
    useEffect(()=>{
        const fetchUrls = async()=>{
                const urls: { [key: string]: string } = {};
                for (const attachment of attachmentMetaInfoList ?? []) {
                    const response = await fetch(`/api/system/files?key=${attachment.key}`);
                    const resp = await response.json();
                    console.log(resp);
                    
                    urls[attachment.key] = resp.url;
                }
                
                setPresignedUrls(urls);
            }
            fetchUrls();
    
    }, [attachmentMetaInfoList]);
    
    if (!attachmentMetaInfoList || attachmentMetaInfoList.length === 0) {
        return null;
    }

    return (
        <div className="mt-4"> 
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attachmentMetaInfoList?.map((attachment, index) => (
                    <div
                        key={index}
                        className="bg-white p-2 rounded-md shadow-md flex flex-col items-center"
                    >
                        {attachment.type.startsWith('image/')? ( 
                                <img
                                    src={presignedUrls[attachment.key]}
                                    alt={attachment.name}
                                    className="max-w-full max-h-48 object-contain rounded-lg mb-2"
                                />
                            
                        ) : (
                            <img src='/file.svg' className="w-8 h-8 text-neutral-200" />
                        )}
                        <p className="text-sm text-gray-700 text-center">
                            {attachment.name} ({formatFileSize(attachment.size)})
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttachmentDisplay;