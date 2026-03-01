import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
  chat: ReactNode;
  sidebarCollapsed: boolean;
  chatCollapsed: boolean;
}

export function Layout({ header, sidebar, main, chat, sidebarCollapsed, chatCollapsed }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.header}>{header}</div>
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {sidebar}
      </div>
      <div className={styles.main}>{main}</div>
      <div className={`${styles.chat} ${chatCollapsed ? styles.chatCollapsed : ''}`}>
        {chat}
      </div>
    </div>
  );
}
