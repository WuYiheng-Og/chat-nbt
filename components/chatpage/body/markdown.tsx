import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard'
import { Clipboard } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useSendPending } from '@/app/context/ChatContext';

interface MarkdownProps {
    content: string;
    role: "user" | "assistant";
    ableToShowLoading: boolean;// 是否能够加载showLoading，即能否具备加载卡基米的能力。
}

export default function Markdown({ content, role, ableToShowLoading }: MarkdownProps) { 
    // 合并 content 和图片的 Markdown 语法
    // const combinedContent = `${content}![Big Cat Run](/biga_cat_run.gif)`;
    const {sendPending} = useSendPending();
    const handleCopy = (text: string) => {
        copy(text);
        toast.success("Copied to clipboard."); 
    }
    const lastNodeRef = useRef<HTMLDivElement>(null);

    const isLastNode = (node: any) => {
        if(!ableToShowLoading) return false;// 如果不是最后一个节点，直接不渲染卡基米跑步。
        return role === "assistant" && node.position?.end.offset === content.length && node.children.length <=2;
      };

    return ( 
        <ReactMarkdown
            className='custom-markdown'
            // remarkPlugins={[remarkGfm, remarkAddClassNameToLastNode('last-node')]}
            components={{
                p: ({ node, children, ...props }) => (
                    <p
                      ref={sendPending && isLastNode(node) ? lastNodeRef : null}
                      className={sendPending && isLastNode(node) ? 'last-node' : ''}
                      {...props}
                    >
                      {children}
                    </p>
                ),
                li: ({ node, children, ...props }) => (
                <div ref={sendPending && isLastNode(node) ? lastNodeRef : null}>
                    <li
                    className={sendPending && isLastNode(node) ? 'last-node' : ''}
                    {...props}
                    >
                    {children}
                    </li>
                </div>
                ),
                h1: ({ node, children, ...props }) => (
                <h1
                    ref={sendPending && isLastNode(node) ? lastNodeRef : null}
                    className={sendPending && isLastNode(node) ? 'last-node' : ''}
                    {...props}
                >
                    {children}
                </h1>
                ),
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
                } 
            }}
        >
            {content}
        </ReactMarkdown> 
    )
} 