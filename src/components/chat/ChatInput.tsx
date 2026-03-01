import { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Try "rent 1500 monthly"'
      />
      <button className={styles.sendBtn} onClick={handleSubmit} disabled={!text.trim()} aria-label="Send">
        <Send size={16} />
      </button>
    </div>
  );
}
