import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function Analytics() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text.primary, marginBottom: '24px' }}>
        Analytics
      </h1>
      <Card title="Financial Analytics">
        <p style={{ color: theme.text.secondary }}>Analytics dashboard coming soon...</p>
      </Card>
    </div>
  );
}
