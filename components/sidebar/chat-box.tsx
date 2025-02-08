import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ArrowDownToLine, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChatBoxProps {
    // Doc代表泛型，反正就是来自chats数据库的一条记录
    chat: Doc<"chats">;
    selected: boolean;
}
export const ChatBox = ({
    chat,
    selected
}: ChatBoxProps) => {
    const rename = useMutation(api.chats.rename);
    const remove = useMutation(api.chats.remove);

    // isEditing:是否存在重命名/删除操作。
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chat.title);

    const router = useRouter();

    // 点击左侧某个chat跳转对应的聊天框
    const handleClick = () => {
        if (!selected) {
            router.push(`/chat/${chat._id}`);
        }
    }
    // 重命名某个chat
    const handleRename = () => {
        rename({ id: chat._id, title: title });
        setIsEditing(false);
    }
    // 删除某个chat，并跳转首页。
    const handleDelete = () => {
        // TODO，此处删除仅仅删除了chat表，没有删除关联的messages
        remove({ id: chat._id });
        router.push('/');
    }
    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter") {
    //         handleRename();
    //     }
    // }

    return (
        <div key={chat.title}
            // 这里cn表示动态css，一方面，hover的chat需要高亮，另一方面，选中的chat也需要高亮。
            className={cn("group relative flex w-full p-2 rounded-md hover:bg-neutral-900 cursor-pointer text-white text-sm", selected && "bg-neutral-800")}
            onClick={handleClick}>
            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleRename}
                    autoFocus
                    className="outline-none bg-transparent w-[170px]"
                />
            ) : (
                <div className="truncate max-w-[200px]">{chat.title}</div>
            )}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex z-10">
                {isEditing ? (
                    <button onClick={handleRename} className={cn("bg-gradient-to-r from-transparent from-0% to-neutral-900 to-30% pl-3 py-1",
                        selected && "to-neutral-800")}>
                        <ArrowDownToLine />
                    </button>
                ) : (
                    <div className={cn("bg-gradient-to-r from-transparent from-0% to-neutral-900 to-30% space-x-2 flex pl-6 py-1",
                        selected && "to-neutral-800")}>
                        <button onClick={() => setIsEditing(true)}>
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
