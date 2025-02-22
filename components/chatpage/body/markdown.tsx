import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard'
import { Clipboard } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
// import remarkGfm from 'remark-gfm';
// import remarkAddClassNameToLastNode from '@/lib/markdown_plugins';

interface MarkdownProps {
    content: string;
    role: "user" | "assistant";
}

export default function Markdown({ content, role }: MarkdownProps) { 
    // 合并 content 和图片的 Markdown 语法
    // const combinedContent = `${content}![Big Cat Run](/biga_cat_run.gif)`;
    const handleCopy = (text: string) => {
        copy(text);
        toast.success("Copied to clipboard."); 
    }
    const lastNodeRef = useRef<HTMLDivElement>(null);

    // 当内容更新时，滚动到最后一个节点
    useEffect(() => {
        if (lastNodeRef.current) {
        lastNodeRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [content]);

    const isLastNode = (node: any) => {
        console.log(node.children.length)
        return node.position?.end.offset === content.length && node.children.length <= 2 && role === "assistant";
      };

    return ( 
        <ReactMarkdown
            className='custom-markdown'
            // remarkPlugins={[remarkGfm, remarkAddClassNameToLastNode('last-node')]}
            components={{
                p: ({ node, children, ...props }) => (
                    <p
                      ref={isLastNode(node) ? lastNodeRef : null}
                      className={isLastNode(node) ? 'last-node' : ''}
                      {...props}
                    >
                      {children}
                    </p>
                ),
                li: ({ node, children, ...props }) => (
                <div ref={isLastNode(node) ? lastNodeRef : null}>
                    <li
                    className={isLastNode(node) ? 'last-node' : ''}
                    {...props}
                    >
                    {children}
                    </li>
                </div>
                ),
                h1: ({ node, children, ...props }) => (
                <h1
                    ref={isLastNode(node) ? lastNodeRef : null}
                    className={isLastNode(node) ? 'last-node' : ''}
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