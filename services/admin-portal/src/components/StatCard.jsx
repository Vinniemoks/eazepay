import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function StatCard({ icon, label, value, change, trend = 'up' }) {
  const { theme } = useTheme();

  const trendColor = trend === 'up' ? theme.success.main : theme.error.main;
  const trendIcon = trend === 'up' ? '↑' : '↓';

  const styles = {
    card: {
      background: theme.background.paper,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    iconWrapper: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${theme.primary}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: '16px',
    },
    label: {
      fontSize: '14px',
      color: theme.text.secondary,
      marginBottom: '8px',
      fontWeight: '500',
    },
    value: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: '8px',
    },
    change: {
      fontSize: '13px',
      color: trendColor,
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.iconWrapper}>{icon}</div>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
      {change && (
        <div style={styles.change}>
          <span>{trendIcon}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
