import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard'
import { Clipboard } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useState } from 'react';
interface MarkdownProps {
    content: string;
}

export default function Markdown({ content }: MarkdownProps) {
    
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState('');
    
    const handleCopy = (text: string) => {
        copy(text);
        toast.success("Copied to clipboard.");
    }
    const handleImageClick = (src: string) => {
        setSelectedImageSrc(src);
        setIsImageModalOpen(true);
    };

    const handleCloseImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImageSrc('');
    };

    return (
        <div>
        <ReactMarkdown
            components={{
                code({className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <div>
                            <div className='flex w-full justify-end bg-white/5 p-2 rounded-t-md'>
                                <button onClick={() => handleCopy(String(children).replace(/\n$/, ''))}>
                                    <Clipboard className="text-white/20 w-4 h-4" />
                                </button>
                            </div>
                            <SyntaxHighlighter
                                language={match[1]}
                                style={gruvboxDark}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        </div >
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    )
                },
                img({src, alt, ...props}) {
                    return (
                        <img  
                            src={src}
                            alt={alt}
                            {...props}
                            onClick={() => handleImageClick(src)}
                            className="cursor-pointer"
                        />
                    )
                }
            }}
        >
            {content}
        </ReactMarkdown>
        {isImageModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-md relative">
                        <button
                            className="absolute top-2 right-2 text-black"
                            onClick={handleCloseImageModal}
                        >
                            &times;
                        </button>
                        <img src={selectedImageSrc} alt="Enlarged" className="max-w-full max-h-full" />
                    </div>
                </div>
            )}
        </div>
    )
}
