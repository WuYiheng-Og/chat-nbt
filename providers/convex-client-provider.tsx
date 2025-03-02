"use client";

import { Loading } from "@/components/auth/loading";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { AuthLoading, Authenticated, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

interface ConvexClientProviderProps {
    children: React.ReactNode
};

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
// 在变量名后面加上感叹号（!）是一种非空断言操作符（Non-null Assertion Operator），因此不需要下面三行代码监测了。
// if (!convexUrl) {
//     throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not defined.');
// }
const convex = new ConvexReactClient(convexUrl);

export const ConvexClientProvider = ({
    children
}: ConvexClientProviderProps) => {
    return (
        <ClerkProvider afterSignOutUrl="/sign-up">
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                <AuthLoading>
                    <Loading />
                </AuthLoading>
                <Authenticated>
                    {children}
                </Authenticated>
                <Unauthenticated>
                    {children}
                </Unauthenticated>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}