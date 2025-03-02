import React, { createContext, useContext, useState } from 'react';

const StreamingContext = createContext<{
    streamingContent: string;
    setStreamingContent: (content: string) => void;
}>({
    streamingContent: '',
    setStreamingContent: () => {},
});

export const useStreamingContent = () => useContext(StreamingContext);

export const StreamingProvider = ({ children }: { children: React.ReactNode }) => {
    const [streamingContent, setStreamingContent] = useState('');

    return (
        <StreamingContext.Provider value={{ streamingContent, setStreamingContent }}>
            {children}
        </StreamingContext.Provider>
    );
};