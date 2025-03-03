import { Loading } from '@/components/auth/loading';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { render } from '@testing-library/react';
import { AuthLoading, Authenticated, ConvexReactClient, Unauthenticated } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConvexClientProvider } from './ConvexClientProvider'; // 替换为实际的文件名

// 模拟依赖
vi.mock('@clerk/nextjs');
vi.mock('convex/react');
vi.mock('convex/react-clerk');
vi.mock('@/components/auth/loading');

describe('ConvexClientProvider', () => {
    let mockChildren: React.ReactNode;

    beforeEach(() => {
        // 初始化模拟子元素
        mockChildren = <div>Mock Children</div>;
        // 重置所有模拟函数的调用历史
        vi.clearAllMocks();
    });

    it('should render ClerkProvider and ConvexProviderWithClerk', () => {
        render(<ConvexClientProvider>{mockChildren}</ConvexClientProvider>);

        expect(ClerkProvider).toHaveBeenCalledWith(
            expect.objectContaining({ afterSignOutUrl: '/sign-up' }),
            expect.anything()
        );
        expect(ConvexProviderWithClerk).toHaveBeenCalledWith(
            expect.objectContaining({ useAuth, client: expect.any(ConvexReactClient) }),
            expect.anything()
        );
    });

    it('should render Loading component in AuthLoading state', () => {
        render(<ConvexClientProvider>{mockChildren}</ConvexClientProvider>);

        expect(AuthLoading).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ children: expect.any(Function) })
        );
        const authLoadingChildren = (AuthLoading as jest.Mock).mock.calls[0][1].children();
        expect(Loading).toHaveBeenCalledWith({}, authLoadingChildren);
    });

    it('should render children in Authenticated state', () => {
        render(<ConvexClientProvider>{mockChildren}</ConvexClientProvider>);

        expect(Authenticated).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ children: mockChildren })
        );
    });

    it('should render children in Unauthenticated state', () => {
        render(<ConvexClientProvider>{mockChildren}</ConvexClientProvider>);

        expect(Unauthenticated).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ children: mockChildren })
        );
    });
});