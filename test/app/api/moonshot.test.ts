import OpenAI from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parse_files_content, sendMsgByMoonshot } from './yourApiFile'; // 替换为实际的文件名

// 模拟 OpenAI 客户端
vi.mock('openai');

describe('Moonshot API functions', () => {
    let mockKimiClient: any;
    let mockChatCompletions: any;
    let mockFiles: any;

    beforeEach(() => {
        // 初始化模拟的 OpenAI 客户端
        mockKimiClient = {
            chat: {
                completions: {
                    create: vi.fn()
                }
            },
            files: {
                content: vi.fn()
            }
        };
        (OpenAI as any).mockImplementation(() => mockKimiClient);
        mockChatCompletions = mockKimiClient.chat.completions;
        mockFiles = mockKimiClient.files;

        // 重置所有模拟函数的调用历史
        vi.clearAllMocks();
    });

    describe('sendMsgByMoonshot', () => {
        it('should return a stream on success', async () => {
            const formattedMessages = [
                { role: 'user', content: 'Hello' }
            ];
            const mockStream = { mock: 'stream' };
            mockChatCompletions.create.mockResolvedValue(mockStream);

            const result = await sendMsgByMoonshot(formattedMessages);

            expect(result).toBe(mockStream);
            expect(mockChatCompletions.create).toHaveBeenCalledWith({
                model: 'moonshot-v1-8k',
                stream: true,
                messages: formattedMessages as any,
                temperature: 0.3
            });
        });

        it('should return null on error', async () => {
            const formattedMessages = [
                { role: 'user', content: 'Hello' }
            ];
            const mockError = new Error('Mock error');
            mockChatCompletions.create.mockRejectedValue(mockError);

            const result = await sendMsgByMoonshot(formattedMessages);

            expect(result).toBeNull();
            expect(mockChatCompletions.create).toHaveBeenCalledWith({
                model: 'moonshot-v1-8k',
                stream: true,
                messages: formattedMessages as any,
                temperature: 0.3
            });
        });
    });

    describe('parse_files_content', () => {
        it('should return file content on success', async () => {
            const fileKey = 'test-file-key';
            const mockFileResponse = {
                text: vi.fn().mockResolvedValue('Mock file content')
            };
            mockFiles.content.mockResolvedValue(mockFileResponse);

            const result = await parse_files_content(fileKey);

            expect(result).toBe('Mock file content');
            expect(mockFiles.content).toHaveBeenCalledWith(fileKey);
            expect(mockFileResponse.text).toHaveBeenCalled();
        });

        it('should log error and return undefined on missing file key', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error');
            const result = await parse_files_content('');

            expect(result).toBeUndefined();
            expect(consoleErrorSpy).toHaveBeenCalledWith('文件传入Key出错');
            consoleErrorSpy.mockRestore();
        });

        it('should log error and return undefined on error', async () => {
            const fileKey = 'test-file-key';
            const mockError = new Error('Mock error');
            mockFiles.content.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error');

            const result = await parse_files_content(fileKey);

            expect(result).toBeUndefined();
            expect(mockFiles.content).toHaveBeenCalledWith(fileKey);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting file content:', mockError);
            expect(consoleErrorSpy).toHaveBeenCalledWith('无法获取文件内容');
            consoleErrorSpy.mockRestore();
        });
    });
});