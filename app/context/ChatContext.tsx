// context/SendPendingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
// （这里共享的Boolean变量就是是否正在进行流式传输）
// 定义 Context 的类型
interface SendPending {
  sendPending: boolean;
  setSendPending: (value: boolean) => void;
}

// 创建 Context
const SendPendingContext = createContext<SendPending | undefined>(undefined);

// 创建 Provider 组件
export const SendPendingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sendPending, setSendPending] = useState<boolean>(false);

  return (
    <SendPendingContext.Provider value={{ sendPending, setSendPending }}>
      {children}
    </SendPendingContext.Provider>
  );
};

// 创建自定义 Hook 以便在组件中使用 Context
export const useSendPending = () => {
  const context = useContext(SendPendingContext);
  if (!context) {
    throw new Error('useSendPending must be used within a SendPendingProvider');
  }
  return context;
};