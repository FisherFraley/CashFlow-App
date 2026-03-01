import { ChatPreviewCard } from './ChatPreviewCard';
import type { ChatMessage as ChatMessageType } from '../../types';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

export function ChatMessage({ message, onConfirm, onReject }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.user : styles.system}`}>
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.systemBubble}`}>
        <p className={styles.text}>{message.text}</p>
        {message.parsedItem && (
          <ChatPreviewCard
            item={message.parsedItem}
            status={message.status}
            onConfirm={() => onConfirm(message.id)}
            onReject={() => onReject(message.id)}
          />
        )}
      </div>
    </div>
  );
}
