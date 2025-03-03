import { SendPendingProvider } from '@/app/context/ChatContext';
import { api } from '@/convex/_generated/api';
import { render, screen, waitFor } from '@testing-library/react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Chat from './Chat';

// 模拟依赖
vi.mock('@/convex/_generated/api');
vi.mock('convex/react');
vi.mock('next/navigation');
vi.mock('@/app/context/ChatContext');

describe('Chat Component', () => {
    let mockParams: { chatId: string };
    let mockChat: any;
    let mockMessages: any[];
    let mockUpdateTitle: jest.Mock;

    beforeEach(() => {
        // 初始化模拟数据
        mockParams = { chatId: 'test-chat-id' };
        mockChat = { id: mockParams.chatId, title: 'Test Chat' };
        mockMessages = [];
        mockUpdateTitle = vi.fn();

        // 模拟钩子
        (useQuery as jest.Mock).mockImplementation((query, { id }) => {
            if (query === api.chats.get) {
                return mockChat;
            }
            if (query === api.messages.list) {
                return mockMessages;
            }
            return null;
        });
        (useMutation as jest.Mock).mockReturnValue(mockUpdateTitle);
        (useRouter as jest.Mock).mockReturnValue({ push: vi.fn() });
    });

    it('should render loader when messages are undefined', () => {
        mockMessages = undefined;
        render(
            <MemoryRouter>
                <SendPendingProvider>
                    <Chat params={Promise.resolve(mockParams)} />
                </SendPendingProvider>
            </MemoryRouter>
        );

        const loader = screen.getByRole('img', { name: /LoaderCircle/i });
        expect(loader).toBeInTheDocument();
    });

    it('should render welcome message when messages are empty', () => {
        mockMessages = [];
        render(
            <MemoryRouter>
                <SendPendingProvider>
                    <Chat params={Promise.resolve(mockParams)} />
                </SendPendingProvider>
            </MemoryRouter>
        );

        const welcomeMessage = screen.getByText('准备好提问了吗？我随时可以开始哦！');
        expect(welcomeMessage).toBeInTheDocument();
    });

    it('should render Body and Form when messages are present', () => {
        mockMessages = [{ id: 'test-message-id', content: 'Test message' }];
        render(
            <MemoryRouter>
                <SendPendingProvider>
                    <Chat params={Promise.resolve(mockParams)} />
                </SendPendingProvider>
            </MemoryRouter>
        );

        const body = screen.getByTestId('body'); // 假设 Body 组件有 data-testid="body"
        const form = screen.getByTestId('form'); // 假设 Form 组件有 data-testid="form"
        expect(body).toBeInTheDocument();
        expect(form).toBeInTheDocument();
    });

    it('should redirect to home page when chat is null', async () => {
        mockChat = null;
        const router = useRouter();
        render(
            <MemoryRouter>
                <SendPendingProvider>
                    <Chat params={Promise.resolve(mockParams)} />
                </SendPendingProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith('/');
        });
    });

    it('should update chat title when there is one message', async () => {
        mockMessages = [{ id: 'test-message-id', content: 'Test question' }];
        render(
            <MemoryRouter>
                <SendPendingProvider>
                    <Chat params={Promise.resolve(mockParams)} />
                </SendPendingProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockUpdateTitle).toHaveBeenCalledWith({
                id: mockParams.chatId,
                title: 'Test question'
            });
        });
    });
});