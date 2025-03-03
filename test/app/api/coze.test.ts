import { CozeAPI } from '@coze/api';
import OSS from 'ali-oss';
import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 模拟依赖
vi.mock('@coze/api');
vi.mock('ali-oss');
vi.mock('fs');
vi.mock('path');

describe('POST API', () => {
    let mockReq: NextRequest;
    let mockFormData: FormData;
    let mockFile: File;

    beforeEach(() => {
        // 初始化模拟数据
        mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        mockFormData = new FormData();
        mockFormData.append('file', mockFile);

        mockReq = {
            formData: async () => mockFormData
        } as unknown as NextRequest;

        // 重置所有模拟函数的调用历史
        vi.clearAllMocks();
    });

    it('should handle file uploads successfully', async () => {
        // 模拟 CozeAPI 的上传方法
        const mockCozeClient = new CozeAPI({} as any);
        const mockUpload = vi.fn().mockResolvedValue({ id: 'test-id' });
        mockCozeClient.files = { upload: mockUpload };
        (CozeAPI as any).mockImplementation(() => mockCozeClient);

        // 模拟阿里云 OSS 的 put 方法
        const mockAliClient = new OSS({} as any);
        const mockPut = vi.fn().mockResolvedValue({});
        mockAliClient.put = mockPut;
        (OSS as any).mockImplementation(() => mockAliClient);

        // 模拟文件操作
        (fs.existsSync as any).mockReturnValue(false);
        (fs.mkdirSync as any).mockReturnValue(undefined);
        (fs.writeFileSync as any).mockReturnValue(undefined);
        (fs.createReadStream as any).mockReturnValue({});
        (fs.unlinkSync as any).mockReturnValue(undefined);

        // 模拟路径操作
        (path.join as any).mockReturnValue('mock/path');

        const response = await POST(mockReq);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.formatFiles).toHaveLength(1);
        expect(data.formatFiles[0].key).toBe('test-id');
        expect(data.formatFiles[0].name).toBe('test.txt');
        expect(data.formatFiles[0].type).toBe('text/plain');
        expect(data.formatFiles[0].size).toBe(mockFile.size);

        expect(mockUpload).toHaveBeenCalledTimes(1);
        expect(mockPut).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on error', async () => {
        // 模拟 CozeAPI 的上传方法抛出错误
        const mockCozeClient = new CozeAPI({} as any);
        const mockUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
        mockCozeClient.files = { upload: mockUpload };
        (CozeAPI as any).mockImplementation(() => mockCozeClient);

        const response = await POST(mockReq);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('无法解析内容');
    });
});