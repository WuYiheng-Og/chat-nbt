import { api } from "@/convex/_generated/api"
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useQuery } from "convex/react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { GPTModel } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";


// 选择对话的模型
export const SelectModel = () => {
    const currentUser = useQuery(api.users.currentUser, {});

    const {
        mutate: selectGPT,
        // pending: selectGPTPending,
    } = useApiMutation(api.users.selectModel);

    const [openSelect, setOpenSelect] = useState(false);
    // const [openUpgradeModel, setOpenUpgradeModel] = useState(false);

    if (currentUser === undefined) {
        return <div>Loading...</div>;
    }

    if (currentUser === null) {
        return <div>User Not Found</div>
    }

    // 对象?.方法，先看对象存不存在，如果存在，再访问方法。
    // 前者？？后者。 前者如果为空，结果返回后者，否则为前者。
    // const isSubscribed = currentUser?.endsOn ?? 0 > Date.now();

    const GPTVersionText = currentUser.model === GPTModel.
        KIMI ? "Kimi" : "Coze";

    const handleClick = (model: GPTModel) => {
        // 更改模型
        selectGPT({ model });
        setOpenSelect(!openSelect);
    }

    const toggleOpen = () => {
        setOpenSelect(!openSelect);
    }

    return (
        <>
            {/* <UpgradeModel
                open={openUpgradeModel}
                setOpen={setOpenUpgradeModel}
            /> */}
            <Popover open={openSelect}>
                <PopoverTrigger
                    onClick={toggleOpen}
                    className="flex space-x-2 font-semibolditems-center"
                >
                    <p>{GPTVersionText}</p>
                    <ChevronDown className="text-white/50 w-5" />
                </PopoverTrigger>
                <PopoverContent className="flex flex-col border-0 bg-neutral-700 text-white p-3 space-y-4">

                    <div
                        onClick={() => handleClick(GPTModel.KIMI)}
                        className="flex items-center text-start cursor-pointer rounded-md justify-start space-x-2 p-2 w-full h-full hover:bg-neutral-600"
                    >
                        <Zap className="w-6 h-6" />
                        <div className="w-full">
                            <p className="font-normal">Kimi</p>
                            <p className="text-white/70">月之暗面大语言模型.</p>
                        </div>
                        <Checkbox id="item1" checked={currentUser.model === GPTModel.KIMI} />
                    </div>
                    <div
                        onClick={() => handleClick(GPTModel.COZE)}
                        className="flex items-center text-start cursor-pointer rounded-md justify-start space-x-2 p-2 w-full h-full hover:bg-neutral-600"
                    >
                        <Sparkles className="w-6 h-6" />
                        <div className="w-full">
                            <p className="font-normal">Coze</p>
                            <p className="text-white/70">字节跳动大语言模型.</p>
                            {/* {!isSubscribed &&
                                <div className="w-full p-2 rounded-lg text-white
                                text-xs text-center font-normal cursor-pointer
                                bg-purple-500 active:bg-purple-700 mt-1.5">
                                    Upgrade to plus
                                </div>
                            } */}
                        </div>
                        <Checkbox id="item2" checked={currentUser.model === GPTModel.COZE} />

                    </div>
                </PopoverContent>
            </Popover>
            <div className="p-10">
    </div>
        </>
    )
}
