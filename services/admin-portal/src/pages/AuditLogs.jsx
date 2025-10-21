import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function AuditLogs() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text.primary, marginBottom: '24px' }}>
        Audit Logs
      </h1>
      <Card title="System Logs">
        <p style={{ color: theme.text.secondary }}>Audit log viewer coming soon...</p>
      </Card>
    </div>
  );
}
