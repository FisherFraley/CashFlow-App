import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBudget } from '../context/BudgetContext';
import { Layout } from './layout/Layout';
import { Header } from './layout/Header';
import { Dashboard } from './dashboard/Dashboard';
import { BudgetManager } from './forms/BudgetManager';
import { ChatPanel } from './chat/ChatPanel';
import { WelcomeModal } from './shared/WelcomeModal';
import { SAMPLE_ITEMS } from '../constants/sampleData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseMessage } from '../utils/chatParser';
import type { ChatMessage } from '../types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'system',
  text: "Hi! Tell me about your income, expenses, or purchases and I'll add them to your budget.\n\nTry:\n\u2022 \"coffee 5 today\"\n\u2022 \"rent 1500 monthly\"\n\u2022 \"salary 5000 per month\"",
  timestamp: new Date().toISOString(),
};

export function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const { items, loadItems, addItem, updateItem } = useBudget();
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('cashflow-welcomed', false);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('cashflow-chat', [WELCOME_MESSAGE]);

  const showWelcome = !hasSeenWelcome && items.length === 0;

  const handleStartFresh = () => {
    setHasSeenWelcome(true);
  };

  const handleLoadSample = () => {
    loadItems(SAMPLE_ITEMS);
    setHasSeenWelcome(true);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  };

  const handleToggleChat = () => {
    setChatCollapsed((prev) => !prev);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  };

  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const result = parseMessage(text, items);

    const systemMsg: ChatMessage = {
      id: uuidv4(),
      role: 'system',
      text: result.feedback,
      timestamp: new Date().toISOString(),
      parsedItem: result.item ?? undefined,
      status: result.item ? 'pending' : undefined,
    };

    setMessages((prev) => [...prev, userMsg, systemMsg]);
  }, [items, setMessages]);

  const handleConfirm = useCallback((messageId: string) => {
    setMessages((prev) => {
      const msg = prev.find((m) => m.id === messageId);
      if (!msg?.parsedItem) return prev;

      const { parsedItem } = msg;

      if (parsedItem.action === 'update' && parsedItem.matchedExistingId) {
        updateItem(parsedItem.matchedExistingId, {
          name: parsedItem.name,
          rawAmount: parsedItem.rawAmount,
          category: parsedItem.category,
          frequency: parsedItem.frequency,
        });
      } else {
        addItem({
          type: parsedItem.type,
          name: parsedItem.name,
          rawAmount: parsedItem.rawAmount,
          category: parsedItem.category,
          frequency: parsedItem.frequency,
        });
      }

      const confirmMsg: ChatMessage = {
        id: uuidv4(),
        role: 'system',
        text: parsedItem.action === 'update'
          ? `Updated "${parsedItem.name}" to $${parsedItem.rawAmount.toLocaleString()}.`
          : `Added "${parsedItem.name}" ($${parsedItem.rawAmount.toLocaleString()}) to your budget.`,
        timestamp: new Date().toISOString(),
      };

      return [
        ...prev.map((m) => m.id === messageId ? { ...m, status: 'confirmed' as const } : m),
        confirmMsg,
      ];
    });
  }, [setMessages, addItem, updateItem]);

  const handleReject = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) =>
      m.id === messageId ? { ...m, status: 'rejected' as const } : m
    ));
  }, [setMessages]);

  return (
    <>
      <Layout
        header={
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            chatCollapsed={chatCollapsed}
            onToggleChat={handleToggleChat}
          />
        }
        sidebar={<BudgetManager />}
        main={<Dashboard />}
        chat={
          <ChatPanel
            messages={messages}
            onSend={handleSendMessage}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        }
        sidebarCollapsed={sidebarCollapsed}
        chatCollapsed={chatCollapsed}
      />
      {showWelcome && (
        <WelcomeModal onStartFresh={handleStartFresh} onLoadSample={handleLoadSample} />
      )}
    </>
  );
}
