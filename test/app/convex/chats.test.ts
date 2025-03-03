import { v } from 'convex/values';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create, get, list, remove, rename } from './chats'; // 替换为实际的文件名

// 模拟 Convex 上下文
const mockCtx = {
    auth: {
        getUserIdentity: vi.fn()
    },
    db: {
        query: vi.fn().mockReturnThis(),
        withIndex: vi.fn().mockReturnThis(),
        unique: vi.fn(),
        insert: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        collect: vi.fn()
    }
};

describe('Chats API', () => {
    beforeEach(() => {
        // 重置所有模拟函数的调用历史
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should return [] if not logged in', async () => {
            mockCtx.auth.getUserIdentity.mockResolvedValue(null);

            const result = await create(mockCtx, {});

            expect(result).toEqual([]);
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
        });

        it('should return null if user not found', async () => {
            const mockIdentity = { tokenIdentifier: 'test-token' };
            mockCtx.auth.getUserIdentity.mockResolvedValue(mockIdentity);
            mockCtx.db.unique.mockResolvedValue(null);

            const result = await create(mockCtx, {});

            expect(result).toBeNull();
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
            expect(mockCtx.db.query).toHaveBeenCalledWith('users');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_token', expect.any(Function));
            expect(mockCtx.db.unique).toHaveBeenCalled();
        });

        it('should create a new chat if user is found', async () => {
            const mockIdentity = { tokenIdentifier: 'test-token' };
            const mockUser = { _id: v.id('users')('test-user-id') };
            const mockChatId = v.id('chats')('test-chat-id');
            mockCtx.auth.getUserIdentity.mockResolvedValue(mockIdentity);
            mockCtx.db.unique.mockResolvedValue(mockUser);
            mockCtx.db.insert.mockResolvedValue(mockChatId);

            const result = await create(mockCtx, {});

            expect(result).toEqual(mockChatId);
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
            expect(mockCtx.db.query).toHaveBeenCalledWith('users');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_token', expect.any(Function));
            expect(mockCtx.db.unique).toHaveBeenCalled();
            expect(mockCtx.db.insert).toHaveBeenCalledWith('chats', {
                userId: mockUser._id,
                title: 'New chat'
            });
        });
    });

    describe('list', () => {
        it('should throw an error if not logged in', async () => {
            mockCtx.auth.getUserIdentity.mockResolvedValue(null);

            await expect(list(mockCtx, {})).rejects.toThrow('Called create chat without logged in user!');
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
        });

        it('should throw an error if user not found', async () => {
            const mockIdentity = { tokenIdentifier: 'test-token' };
            mockCtx.auth.getUserIdentity.mockResolvedValue(mockIdentity);
            mockCtx.db.unique.mockResolvedValue(null);

            await expect(list(mockCtx, {})).rejects.toThrow('User not found!');
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
            expect(mockCtx.db.query).toHaveBeenCalledWith('users');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_token', expect.any(Function));
            expect(mockCtx.db.unique).toHaveBeenCalled();
        });

        it('should list chats if user is found', async () => {
            const mockIdentity = { tokenIdentifier: 'test-token' };
            const mockUser = { _id: v.id('users')('test-user-id') };
            const mockChats = [{ id: 'chat-1' }, { id: 'chat-2' }];
            mockCtx.auth.getUserIdentity.mockResolvedValue(mockIdentity);
            mockCtx.db.unique.mockResolvedValue(mockUser);
            mockCtx.db.collect.mockResolvedValue(mockChats);

            const result = await list(mockCtx, {});

            expect(result).toEqual(mockChats);
            expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
            expect(mockCtx.db.query).toHaveBeenCalledWith('users');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_token', expect.any(Function));
            expect(mockCtx.db.unique).toHaveBeenCalled();
            expect(mockCtx.db.query).toHaveBeenCalledWith('chats');
            expect(mockCtx.db.withIndex).toHaveBeenCalledWith('by_userId', expect.any(Function));
            expect(mockCtx.db.collect).toHaveBeenCalled();
        });
    });

    describe('rename', () => {
        it('should rename a chat', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockTitle = 'Renamed chat';
            const mockArgs = { id: mockChatId, title: mockTitle };

            await rename(mockCtx, mockArgs);

            expect(mockCtx.db.patch).toHaveBeenCalledWith(mockChatId, {
                title: mockTitle
            });
        });
    });

    describe('remove', () => {
        it('should remove a chat', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockArgs = { id: mockChatId };

            await remove(mockCtx, mockArgs);

            expect(mockCtx.db.delete).toHaveBeenCalledWith(mockChatId);
        });
    });

    describe('get', () => {
        it('should get a chat', async () => {
            const mockChatId = v.id('chats')('test-chat-id');
            const mockChat = { id: mockChatId, title: 'Test chat' };
            const mockArgs = { id: mockChatId };
            mockCtx.db.get.mockResolvedValue(mockChat);

            const result = await get(mockCtx, mockArgs);

            expect(result).toEqual(mockChat);
            expect(mockCtx.db.get).toHaveBeenCalledWith(mockChatId);
        });
    });
});