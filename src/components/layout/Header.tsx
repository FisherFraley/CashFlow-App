import { useRef } from 'react';
import { Sun, Moon, PanelLeft, MessageSquare, Download, Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useBudget } from '../../context/BudgetContext';
import styles from './Header.module.css';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  chatCollapsed: boolean;
  onToggleChat: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar, chatCollapsed, onToggleChat }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { exportData, importData } = useBudget();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-budget-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importData(reader.result as string);
      if (!success) alert('Invalid budget file. Please check the format.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.iconBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title={sidebarCollapsed ? 'Show budget sidebar' : 'Hide budget sidebar'}
        >
          <PanelLeft size={20} />
        </button>
        <h1 className={styles.title}>Cash Flow Planner</h1>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={handleExport} aria-label="Export data" title="Export budget">
          <Download size={18} />
        </button>
        <button className={styles.iconBtn} onClick={handleImport} aria-label="Import data" title="Import budget">
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          className={styles.iconBtn}
          onClick={onToggleChat}
          aria-label="Toggle chat"
          title={chatCollapsed ? 'Show chat panel' : 'Hide chat panel'}
        >
          <MessageSquare size={18} />
        </button>
        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
