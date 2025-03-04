import copy from 'copy-to-clipboard';
import { Element } from 'hast';
import { Clipboard } from 'lucide-react';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { toast } from 'sonner';
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

    const isLastNode = (node: Element) => {
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
                        ref={isLastNode(node as Element) ? lastNodeRef : null}
                        className={isLastNode(node as Element) ? 'last-node' : ''}
                        {...props}
                    >
                        {children}
                    </p>
                ),
                li: ({ node, children, ...props }) => (
                    <div ref={isLastNode(node as Element) ? lastNodeRef : null}>
                        <li
                            className={isLastNode(node as Element) ? 'last-node' : ''}
                            {...props}
                        >
                            {children}
                        </li>
                    </div>
                ),
                h1: ({ node, children, ...props }) => (
                    <h1
                        ref={isLastNode(node as Element) ? lastNodeRef : null}
                        className={isLastNode(node as Element) ? 'last-node' : ''}
                        {...props}
                    >
                        {children}
                    </h1>
                ),
                code({ className, children, ...props }) {
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