import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function AccessRequests() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text.primary, marginBottom: '24px' }}>
        Access Requests
      </h1>
      <Card title="Pending Requests">
        <p style={{ color: theme.text.secondary }}>Access request management interface coming soon...</p>
      </Card>
    </div>
  );
}
