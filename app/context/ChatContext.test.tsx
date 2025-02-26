import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SendPendingProvider, useSendPending } from './ChatContext';
import React from 'react';

// 创建一个测试组件来使用 useSendPending
const TestComponent = () => {
  const { sendPending, setSendPending } = useSendPending();
  return (
    <div>
      <span data-testid="send-pending">{sendPending.toString()}</span>
      <button data-testid="toggle-button" onClick={() => setSendPending(!sendPending)}>
        Toggle
      </button>
    </div>
  );
};

describe('SendPendingContext', () => {
  it('全局共享状态sendPending and setSendPending被SendPendingProvider包裹，测试sendPending的修改与状态确认', async () => {
    render(
      <SendPendingProvider>
        <TestComponent />
      </SendPendingProvider>
    );

    // 检查初始状态
    const sendPendingElement = screen.getByTestId('send-pending');
    expect(sendPendingElement.textContent).toBe('false');

    // 点击按钮切换状态
    const toggleButton = screen.getByTestId('toggle-button');
    toggleButton.click();

    // 等待状态更新完成
    await waitFor(() => {
      expect(sendPendingElement.textContent).toBe('true');
    });
  });

  it('在SendPendingProvider外侧使用sendPending会报错', () => {
    let error: Error | null = null;
    try {
      render(<TestComponent />);
    } catch (e) {
        if (e instanceof Error) {
            error = e;
        }
    }

    expect(error).toBeInstanceOf(Error);
    if (error) {
        expect(error.message).toContain('useSendPending must be used within a SendPendingProvider');
    }
  });
});