import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ userRole }) {
  const { theme } = useTheme();

  const superuserLinks = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'User Management' },
    { path: '/permissions', icon: '🔐', label: 'Permissions' },
    { path: '/access-requests', icon: '📝', label: 'Access Requests' },
    { path: '/organization', icon: '🏢', label: 'Organization' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/audit-logs', icon: '📋', label: 'Audit Logs' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const adminLinks = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/team', icon: '👥', label: 'My Team' },
    { path: '/access-requests', icon: '📝', label: 'Access Requests' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const links = userRole === 'SUPERUSER' ? superuserLinks : adminLinks;

  const styles = {
    sidebar: {
      width: '260px',
      height: '100vh',
      background: theme.background.paper,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    },
    logo: {
      padding: '24px',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    logoText: {
      fontSize: '18px',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    nav: {
      flex: 1,
      padding: '16px',
      overflowY: 'auto',
    },
    link: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? theme.primary : theme.text.secondary,
      background: isActive ? `${theme.primary}15` : 'transparent',
      marginBottom: '4px',
      transition: 'all 0.2s ease',
      fontWeight: isActive ? '600' : '500',
      fontSize: '14px',
    }),
    icon: {
      fontSize: '18px',
    },
    badge: {
      marginLeft: 'auto',
      background: theme.error.main,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>👑</div>
        <div style={styles.logoText}>Eazepay Admin</div>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => styles.link(isActive)}
          >
            <span style={styles.icon}>{link.icon}</span>
            <span>{link.label}</span>
            {link.badge && <span style={styles.badge}>{link.badge}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
