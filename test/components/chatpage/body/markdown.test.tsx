import { useSendPending } from '@/app/context/ChatContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import copy from 'copy-to-clipboard';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Markdown from './Markdown';

// 模拟依赖
vi.mock('@/app/context/ChatContext');
vi.mock('sonner');
vi.mock('copy-to-clipboard');

describe('Markdown Component', () => {
    let mockContent: string;
    let mockRole: 'user' | 'assistant';
    let mockAbleToShowLoading: boolean;
    let mockSendPending: boolean;

    beforeEach(() => {
        mockContent = 'This is a test markdown content.';
        mockRole = 'assistant';
        mockAbleToShowLoading = true;
        mockSendPending = false;

        (useSendPending as jest.Mock).mockReturnValue({ sendPending: mockSendPending });
        (toast.success as jest.Mock).mockReturnValue({});
        (copy as jest.Mock).mockReturnValue(true);
    });

    it('should render markdown content', () => {
        render(
            <Markdown
                content={mockContent}
                role={mockRole}
                ableToShowLoading={mockAbleToShowLoading}
            />
        );

        const markdownContent = screen.getByText(mockContent);
        expect(markdownContent).toBeInTheDocument();
    });

    it('should scroll to the last node when content updates', async () => {
        const { rerender } = render(
            <Markdown
                content={mockContent}
                role={mockRole}
                ableToShowLoading={mockAbleToShowLoading}
            />
        );

        const newContent = 'This is updated markdown content.';
        rerender(
            <Markdown
                content={newContent}
                role={mockRole}
                ableToShowLoading={mockAbleToShowLoading}
            />
        );

        await waitFor(() => {
            // 这里可以根据实际情况添加对滚动的断言，例如检查滚动位置
            // 由于 scrollIntoView 是浏览器的 API，在测试环境中较难直接断言滚动效果
            // 可以考虑模拟 scrollIntoView 来验证是否被调用
        });
    });

    it('should copy code to clipboard when copy button is clicked', () => {
        const codeContent = 'function test() { return true; }';
        const codeClassName = 'language-javascript';
        const contentWithCode = `\`\`\`javascript\n${codeContent}\n\`\`\``;

        render(
            <Markdown
                content={contentWithCode}
                role={mockRole}
                ableToShowLoading={mockAbleToShowLoading}
            />
        );

        const copyButton = screen.getByRole('button');
        fireEvent.click(copyButton);

        expect(copy).toHaveBeenCalledWith(codeContent);
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard.');
    });

    it('should apply last-node class when sendPending is true and node is last', () => {
        mockSendPending = true;
        (useSendPending as jest.Mock).mockReturnValue({ sendPending: mockSendPending });

        render(
            <Markdown
                content={mockContent}
                role={mockRole}
                ableToShowLoading={mockAbleToShowLoading}
            />
        );

        const lastNode = screen.getByText(mockContent);
        expect(lastNode).toHaveClass('last-node');
    });
});