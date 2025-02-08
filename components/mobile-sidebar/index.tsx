import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet"
import { NewChatButton } from "../sidebar/new-chat-button"
import { ChatList } from "../sidebar/chat-list"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export const MobileSidebar = () => {
    
    return (
        <div className="block lg:hidden">
            <Sheet>
                <SheetTrigger>
                    <Menu className="text-white" />
                </SheetTrigger>
                <SheetContent side={"left"} className="h-full flex p-4 bg-neutral-950 flex-col">\
                    {/* 下面这个盲人友好，得写，不然会报错 */}
                    <VisuallyHidden asChild>
                        <SheetTitle>
                            聊天列表
                        </SheetTitle>
                    </VisuallyHidden>
                    <NewChatButton />
                    <ChatList />
                </SheetContent>
            </Sheet>
        </div>
    )
}