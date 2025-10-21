import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import axios from 'axios';

export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    pendingRequests: 0,
    todayTransactions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard/stats');
      setStats(res.data.stats);
      setRecentActivity(res.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const styles = {
    container: {
      padding: '32px',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: theme.text.secondary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      borderRadius: '12px',
      background: theme.background.default,
      marginBottom: '12px',
    },
    activityIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: `${theme.primary}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: '4px',
    },
    activityTime: {
      fontSize: '12px',
      color: theme.text.secondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Welcome back! Here's what's happening today.</p>
      </div>

      <div style={styles.grid}>
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12% from last month"
          trend="up"
        />
        <StatCard
          icon="🔐"
          label="Active Admins"
          value={stats.activeAdmins}
          change="+3 this week"
          trend="up"
        />
        <StatCard
          icon="📝"
          label="Pending Requests"
          value={stats.pendingRequests}
          change="-5 from yesterday"
          trend="down"
        />
        <StatCard
          icon="💰"
          label="Today's Transactions"
          value={`$${stats.todayTransactions.toLocaleString()}`}
          change="+8% from yesterday"
          trend="up"
        />
      </div>

      <Card title="Recent Activity">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div key={index} style={styles.activityItem}>
              <div style={styles.activityIcon}>{activity.icon}</div>
              <div style={styles.activityContent}>
                <div style={styles.activityTitle}>{activity.title}</div>
                <div style={styles.activityTime}>{activity.time}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: theme.text.secondary, textAlign: 'center' }}>
            No recent activity
          </p>
        )}
      </Card>
    </div>
  );
}
