import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Card({ title, children, action, className = '', style = {} }) {
  const { theme } = useTheme();

  const styles = {
    card: {
      background: theme.background.paper,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      ...style,
    },
    header: {
      padding: '20px 24px',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text.primary,
    },
    body: {
      padding: '24px',
    },
  };

  return (
    <div style={styles.card} className={className}>
      {title && (
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          {action}
        </div>
      )}
      <div style={styles.body}>{children}</div>
    </div>
  );
}
