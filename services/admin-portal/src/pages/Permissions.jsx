import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function Permissions() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text.primary, marginBottom: '24px' }}>
        Permission Management
      </h1>
      <Card title="Permission Codes">
        <p style={{ color: theme.text.secondary }}>Permission management interface coming soon...</p>
      </Card>
    </div>
  );
}
