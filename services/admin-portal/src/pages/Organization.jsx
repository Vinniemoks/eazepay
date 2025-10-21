import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function Organization() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text.primary, marginBottom: '24px' }}>
        Organization Structure
      </h1>
      <Card title="Hierarchy">
        <p style={{ color: theme.text.secondary }}>Organization hierarchy interface coming soon...</p>
      </Card>
    </div>
  );
}
