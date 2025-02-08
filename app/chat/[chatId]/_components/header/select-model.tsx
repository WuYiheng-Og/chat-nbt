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
// import { UpgradeModel } from "./upgrade-model";

// 选择对话的模型
export const SelectModel = () => {
    const currentUser = useQuery(api.users.currentUser, {});

    const {
        mutate: selectGPT,
        // pending: selectGPTPending,
    } = useApiMutation(api.users.selectGPT);

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
    const isSubscribed = currentUser?.endsOn ?? 0 > Date.now();

    const GPTVersionText = currentUser.model === GPTModel.
        GPT3 ? "3.5" : "4.0";

    const handleClick = (model: GPTModel) => {
        //  if gpt-3, just select and return
        if (model === GPTModel.GPT3) {
            selectGPT({ model });
            setOpenSelect(!openSelect);
            return;
        }
        // if gpt-4
        if (isSubscribed) {
            selectGPT({ model });
        } else {
            // setOpenUpgradeModel(true);
        }
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
                    <p>ChatGPT</p>
                    <p className="text-white/50">{GPTVersionText}</p>
                    <ChevronDown className="text-white/50 w-5" />
                </PopoverTrigger>
                <PopoverContent className="flex flex-col border-0 bg-neutral-700 text-white p-3 space-y-4">

                    <div
                        onClick={() => handleClick(GPTModel.GPT3)}
                        className="flex items-center text-start cursor-pointer rounded-md justify-start space-x-2 p-2 w-full h-full hover:bg-neutral-600"
                    >
                        <Zap className="w-6 h-6" />
                        <div className="w-full">
                            <p className="font-normal">GPT 3.5</p>
                            <p className="text-white/70">Great for everday tasks.</p>
                        </div>
                        <Checkbox id="item1" checked={currentUser.model === GPTModel.GPT3} />
                    </div>
                    <div
                        onClick={() => handleClick(GPTModel.GPT4)}
                        className="flex items-center text-start cursor-pointer rounded-md justify-start space-x-2 p-2 w-full h-full hover:bg-neutral-600"
                    >
                        <Sparkles className="w-6 h-6" />
                        <div className="w-full">
                            <p className="font-normal">GPT 4.0</p>
                            <p className="text-white/70">Our smartest and best model.</p>
                            {!isSubscribed &&
                                <div className="w-full p-2 rounded-lg text-white
                                text-xs text-center font-normal cursor-pointer
                                bg-purple-500 active:bg-purple-700 mt-1.5">
                                    Upgrade to plus
                                </div>
                            }
                        </div>
                        <Checkbox id="item2" checked={currentUser.model === GPTModel.GPT4} />

                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}
