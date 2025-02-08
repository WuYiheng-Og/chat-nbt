import { useMutation } from "convex/react";
import { useState } from "react";
// mutation：数据库执行修改、删除、增加操作
// pending: 主要用于控制组件的 UI 显示，让用户了解当前操作的状态。例如，在突变操作进行时显示加载状态，避免用户重复点击操作等。
export const useApiMutation = (mutationFunction: any) => {
    const [pending, setPending] = useState(false);
    const apiMutation = useMutation(mutationFunction);
    const mutate = (payload: any) => {
        setPending(true);
        return apiMutation(payload)
            .then((result) => {
                return result
            })
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                setPending(false)
            })
    }
    return {
        mutate,
        pending
    }
}