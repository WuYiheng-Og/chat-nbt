import { InlineBody } from "@/components/chatpage/inline-body";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Command, CommandItem, CommandList } from "cmdk";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";


interface FormProps {
  chatId: Id<"chats">;
}

export const SearchCommand = ({ chatId }: FormProps) => {
  const [open, setOpen] = useState(false);
  const [search] = useState("");
  const [message, setMessage] = useState<string>("");
  const [issend, setIssend] = useState<boolean>(false);

  const chat = useQuery(api.chats.get, { id: chatId });
  const user = useQuery(api.users.currentUser, {});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 处理消息发送
  const handleSendMessage = async () => {
    if (message.trim() === "" || !chat) return;

    console.log("message sent:", message);
    const temp = message;
    setMessage("");

    await fetch("/api/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "user",
        content: temp,
        chatId: chat._id,
        curUser: user!,
      }),
    });


  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
      setIssend(true);
    }
  };

  // 搜索结果
  const searchResults = [
    { label: "learn ChatNBT" },
    { label: "About ChatNBT" },
    { label: "nextjs+react+convex" },
    { label: "Environment Variables" },
    { label: "Functions" },
    { label: "Fluid Compute" },
    { label: "github" },
  ].filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed top-16 right-5 bg-neutral-800 hover:bg-slate-500 border-neutral-500 p-3 flex items-center space-x-2 shadow-lg rounded-lg"
        >
          <Search className="w-5 h-5 text-slate-50" />
          <span className="text-white">Search...</span>
          <kbd className="text-sm text-white">⌘K</kbd>
        </Button>

      </DialogTrigger>

      <DialogContent className="p-4 max-w-lg mx-auto bg-neutral-600 rounded-lg shadow-lg">
        <DialogTitle className="text-white">Search</DialogTitle>
        <Command>
          <div className="relative w-full p-2">
            <Input
              placeholder="Message TalkGPT..."
              className="w-full h-12 px-4 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:border-r-cyan-50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 根据 issend 状态切换渲染 */}
          {issend ? <InlineBody chatId={chatId} /> : (
            chat ? (
              <CommandList>
                {searchResults.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => setMessage(item.label)} // 赋值给 input 绑定的 message
                    className="cursor-pointer px-4 py-2  text-zinc-300 hover:bg-gray-500 rounded "
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandList>
            ) : (
              <div className="text-center text-gray-600 py-2">Loading chat...</div>
            )
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};
