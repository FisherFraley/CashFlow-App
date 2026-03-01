import { useRef, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage as ChatMessageBubble } from './ChatMessage';
import type { ChatMessage } from '../../types';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onConfirm: (messageId: string) => void;
  onReject: (messageId: string) => void;
}

export function ChatPanel({ messages, onSend, onConfirm, onReject }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Quick Add</h3>
      </div>

      <div className={styles.messages}>
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onConfirm={onConfirm}
            onReject={onReject}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} />
    </div>
  );
}
