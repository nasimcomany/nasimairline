import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChatMode = 'normal' | 'luggage_tracking';

interface ChatContextType {
  isOpen: boolean;
  chatMode: ChatMode;
  openChat: (mode?: ChatMode) => void;
  closeChat: () => void;
  setChatMode: (mode: ChatMode) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatModeState] = useState<ChatMode>('normal');

  const openChat = (mode: ChatMode = 'normal') => {
    setChatModeState(mode);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setChatModeState('normal');
  };

  const setChatMode = (mode: ChatMode) => {
    setChatModeState(mode);
  };

  return (
    <ChatContext.Provider value={{ isOpen, chatMode, openChat, closeChat, setChatMode }}>
      {children}
    </ChatContext.Provider>
  );
};
