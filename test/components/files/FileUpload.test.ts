import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload'; // 替换为实际的文件名
import { Paperclip } from 'lucide-react';
import { GPTModel } from '@/lib/types';

// 模拟 fetch 函数
global.fetch = vi.fn();

describe('FileUpload Component', () => {
    let onFileSelectMock: jest.Mock;
    let onFileUploadingMock: jest.Mock;
    let model: string;
    let sendPending: boolean;

    beforeEach(() => {
        onFileSelectMock = vi.fn();
        onFileUploadingMock = vi.fn();
        model = GPTModel.KIMI;
        sendPending = false;
        (fetch as jest.Mock).mockResolvedValue({
            json: vi.fn().mockResolvedValue({ formatFiles: [] })
        });
    });

    it('should render Paperclip icon', () => {
        render(
            <FileUpload
                onFileSelect={onFileSelectMock}
                onFileUploading={onFileUploadingMock}
                model={model}
                sendPending={sendPending}
            />
        );
        const paperclipIcon = screen.getByRole('img', { name: /Paperclip/i });
        expect(paperclipIcon).toBeInTheDocument();
    });

    it('should call handleUpload when Paperclip icon is clicked and not uploading or sending', () => {
        render(
            <FileUpload
                onFileSelect={onFileSelectMock}
                onFileUploading={onFileUploadingMock}
                model={model}
                sendPending={sendPending}
            />
        );
        const paperclipIcon = screen.getByRole('img', { name: /Paperclip/i });
        fireEvent.click(paperclipIcon);
        const fileInput = screen.getByRole('textbox', { hidden: true });
        expect(fileInput.click).toHaveBeenCalled();
    });

    it('should not call handleUpload when uploading', () => {
        const isUploading = true;
        render(
            <FileUpload
                onFileSelect={onFileSelectMock}
                onFileUploading={onFileUploadingMock}
                model={model}
                sendPending={sendPending}
            />
        );
        const paperclipIcon = screen.getByRole('img', { name: /Paperclip/i });
        fireEvent.click(paperclipIcon);
        const fileInput = screen.getByRole('textbox', { hidden: true });
        expect(fileInput.click).not.toHaveBeenCalled();
    });

    it('should not call handleUpload when sending', () => {
        sendPending = true;
        render(
            <FileUpload
                onFileSelect={onFileSelectMock}
                onFileUploading={onFileUploadingMock}
                model={model}
                sendPending={sendPending}
            />
        );
        const paperclipIcon = screen.getByRole('img', { name: /Paperclip/i });
        fireEvent.click(paperclipIcon);
        const fileInput = screen.getByRole('textbox', { hidden: true });
        expect(fileInput.click).not.toHaveBeenCalled();
    });

    it('should call onFileSelect and onFileUploading when files are selected', async () => {
        const mockFiles = [new File([''], 'test.txt', { type: 'text/plain' })];
        render(
            <FileUpload
                onFileSelect={onFileSelectMock}
                onFileUploading={onFileUploadingMock}
                model={model}
                sendPending={sendPending}
            />
        );
        const fileInput = screen.getByRole('textbox', { hidden: true });
        fireEvent.change(fileInput, {
            target: { files: mockFiles as FileList }
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(onFileSelectMock).toHaveBeenCalledWith(mockFiles);
        expect(onFileUploadingMock).toHaveBeenCalledTimes(2);
        expect(onFileUploadingMock).toHaveBeenNthCalledWith(1, true, []);
        expect(onFileUploadingMock).toHaveBeenNthCalledWith(2, false, []);
    });
});