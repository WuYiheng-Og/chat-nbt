import { v } from 'convex/values';
import fetchMock from 'jest-fetch-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { list, parse_files, retrieve, send, update } from './messages'; // 替换为实际的文件名

// 模拟 Convex 上下文
const mockCtx = {
    db: {
        query: vi.fn().mockReturnThis(),
        withIndex: vi.fn().mockReturnThis(),
        collect: vi.fn(),
        insert: vi.fn(),
        patch: vi.fn(),
        order: vi.fn().mockReturnThis(),
        take: vi.fn()
    }
};

// 初始化 fetch 模拟
fetchMock.enableMocks();

describe('Messages API', () => {
    beforeEach(() => {
        // 重置所有模拟函数的调用历史
        vi.clearAllMocks();
        fetchMock.resetMocks();
    });

    describe('list', () => {
        it('should list messages by chatId', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockMessages = [{ id: 'message-1' }, { id: 'message-2' }];
            mockCtx.db.collect.mockResolvedValue(mockMessages);

            const result = await list(mockCtx, { chatId: mockChatId });

            expect(mockCtx.db.query).toHaveBeenCalledWith('messages');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_chatId', expect.any(Function));
            expect(mockCtx.db.collect).toHaveBeenCalled();
            expect(result).toEqual(mockMessages);
        });
    });

    describe('send', () => {
        it('should send a message', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockArgs = {
                role: 'user',
                content: 'Test message',
                chatId: mockChatId,
                attachmentMetaInfo: {
                    key: 'test-key',
                    type: 'text/plain',
                    name: 'test.txt',
                    size: 1024
                },
                attachmentMetaInfoList: [
                    {
                        key: 'test-key-2',
                        type: 'image/jpeg',
                        name: 'test.jpg',
                        size: 2048
                    }
                ]
            };
            const mockNewMessageId = v.id('messages')('new-message-id');
            mockCtx.db.insert.mockResolvedValue(mockNewMessageId);

            const result = await send(mockCtx, mockArgs);

            expect(mockCtx.db.insert).toHaveBeenCalledWith('messages', {
                role: mockArgs.role,
                content: mockArgs.content,
                chatId: mockArgs.chatId,
                attachmentMetaInfo: mockArgs.attachmentMetaInfo,
                attachmentMetaInfoList: mockArgs.attachmentMetaInfoList
            });
            expect(result).toEqual(mockNewMessageId);
        });
    });

    describe('retrieve', () => {
        it('should retrieve the last 5 messages by chatId', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockMessages = [{ id: 'message-1' }, { id: 'message-2' }, { id: 'message-3' }, { id: 'message-4' }, { id: 'message-5' }];
            mockCtx.db.take.mockResolvedValue(mockMessages);

            const result = await retrieve(mockCtx, { chatId: mockChatId });

            expect(mockCtx.db.query).toHaveBeenCalledWith('messages');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_chatId', expect.any(Function));
            expect(mockCtx.db.order).toHaveBeenCalledWith('desc');
            expect(mockCtx.db.take).toHaveBeenCalledWith(5);
            expect(result).toEqual(mockMessages);
        });
    });

    describe('parse_files', () => {
        it('should parse files and return messages', async () => {
            const mockFiles = [
                {
                    key: 'test-key',
                    name: 'test.txt',
                    type: 'text/plain',
                    size: 1024
                }
            ];
            const mockResponse = {
                json: vi.fn().mockResolvedValue({ fileContent: 'Test file content' })
            };
            fetchMock.mockResolvedValue(mockResponse as any);

            const result = await parse_files(mockFiles);

            expect(fetch).toHaveBeenCalledWith(`/api/moonshot/files?key=${mockFiles[0].key}`);
            expect(mockResponse.json).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    role: 'system',
                    content: 'Test file content',
                    metaInfo: mockFiles[0]
                }
            ]);
        });

        it('should throw an error on failed fetch', async () => {
            const mockFiles = [
                {
                    key: 'test-key',
                    name: 'test.txt',
                    type: 'text/plain',
                    size: 1024
                }
            ];
            const mockResponse = {
                ok: false,
                status: 404
            };
            fetchMock.mockResolvedValue(mockResponse as any);

            await expect(parse_files(mockFiles)).rejects.toThrow(`HTTP error! status: ${mockResponse.status}`);
        });
    });

    describe('update', () => {
        it('should update a message', async () => {
            const mockMessageId = v.id('messages')('test-message-id');
            const mockArgs = {
                messageId: mockMessageId,
                content: 'Updated message'
            };

            await update(mockCtx, mockArgs);

            expect(mockCtx.db.patch).toHaveBeenCalledWith(mockMessageId, {
                content: mockArgs.content
            });
        });
    });
});