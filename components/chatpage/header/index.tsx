import { UserButton } from "@clerk/nextjs"
import { SelectModel } from "./select-model"
import { MobileSidebar } from "@/components/mobile-sidebar"

export const Header = () => {
    return (
        <div className="flex h-[100px] justify-between p-5">
            <MobileSidebar />
            {/* 用户选择对话模型 */}
            <SelectModel />
            {/* 用户按钮，个人信息等 */}
            <UserButton />
        </div>
    )
} 