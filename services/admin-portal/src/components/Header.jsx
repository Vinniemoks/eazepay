import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ user }) {
  const { theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  const styles = {
    header: {
      height: '70px',
      background: theme.background.paper,
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      left: '260px',
      right: 0,
      zIndex: 99,
    },
    search: {
      flex: 1,
      maxWidth: '500px',
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '10px 16px 10px 40px',
      border: `1px solid ${theme.border}`,
      borderRadius: '10px',
      background: theme.background.default,
      color: theme.text.primary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.text.secondary,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      border: `1px solid ${theme.border}`,
      background: theme.background.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      background: theme.error.main,
      color: 'white',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      fontSize: '10px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 12px 6px 6px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    profileName: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text.primary,
    },
    profileRole: {
      fontSize: '12px',
      color: theme.text.secondary,
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.search}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search users, permissions, logs..."
          style={styles.searchInput}
        />
      </div>

      <div style={styles.actions}>
        <button style={styles.iconButton}>
          🔔
          <span style={styles.badge}>3</span>
        </button>

        <ThemeToggle />

        <div style={styles.profile} onClick={() => setShowProfile(!showProfile)}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{user?.name || 'Admin'}</div>
            <div style={styles.profileRole}>{user?.role || 'SUPERUSER'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
