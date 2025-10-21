import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import axios from 'axios';

export default function Users() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?filter=${filter}`);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const styles = {
    container: { padding: '32px' },
    header: { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '28px', fontWeight: '700', color: theme.text.primary },
    filters: { display: 'flex', gap: '12px', marginBottom: '24px' },
    filterButton: (active) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${active ? theme.primary : theme.border}`,
      background: active ? `${theme.primary}15` : 'transparent',
      color: active ? theme.primary : theme.text.secondary,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    }),
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: `1px solid ${theme.border}`, color: theme.text.secondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
    td: { padding: '16px 12px', borderBottom: `1px solid ${theme.border}`, color: theme.text.primary },
    badge: (status) => ({
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      background: status === 'ACTIVE' ? `${theme.success.main}15` : `${theme.neutral[400]}15`,
      color: status === 'ACTIVE' ? theme.success.main : theme.neutral[600],
    }),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button style={{ padding: '10px 20px', background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          + Add User
        </button>
      </div>

      <div style={styles.filters}>
        {['all', 'admins', 'managers', 'pending'].map(f => (
          <button key={f} style={styles.filterButton(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{user.department}</td>
                <td style={styles.td}><span style={styles.badge(user.status)}>{user.status}</span></td>
                <td style={styles.td}>...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
