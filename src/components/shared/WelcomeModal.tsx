import { Sparkles, FileSpreadsheet } from 'lucide-react';
import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  onStartFresh: () => void;
  onLoadSample: () => void;
}

export function WelcomeModal({ onStartFresh, onLoadSample }: WelcomeModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Cash Flow Planner</h1>
        <p className={styles.subtitle}>
          Visualize where your money goes with an interactive Sankey diagram.
          Track income, expenses, savings goals, and one-time purchases — all in your browser.
        </p>
        <div className={styles.actions}>
          <button className={styles.option} onClick={onLoadSample}>
            <Sparkles size={24} />
            <span className={styles.optionTitle}>Load Sample Budget</span>
            <span className={styles.optionDesc}>See a realistic new-grad budget to explore the app.</span>
          </button>
          <button className={styles.option} onClick={onStartFresh}>
            <FileSpreadsheet size={24} />
            <span className={styles.optionTitle}>Start from Scratch</span>
            <span className={styles.optionDesc}>Build your own budget from zero.</span>
          </button>
        </div>
        <p className={styles.footer}>
          Your data stays in your browser. Nothing is sent to any server.
        </p>
      </div>
    </div>
  );
}
