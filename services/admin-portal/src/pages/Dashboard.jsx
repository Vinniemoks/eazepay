import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StatCard,
  ActivityTimeline,
  AnalyticsCard,
  QuickActions,
  PerformanceMetrics,
  NotificationCenter
} from '../../../shared/components/dashboard';
import { Card } from '../../../shared/components/ui';
import '../../../shared/styles/dashboard.css';
import '../../../shared/styles/animations.css';
import '../../../shared/styles/dashboard-animations.css';
import '../../../shared/styles/premium-visuals.css';
import {
  PremiumStatistic,
  PremiumMetricCard,
  ActivityStream,
  PremiumDataTable,
  PerformanceWidget,
  AlertBanner
} from '../../../shared/components/premium-components';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    pendingRequests: 0,
    todayTransactions: 0,
    systemHealth: 100,
    totalRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    systemUptime: 100,
    apiLatency: 0,
    errorRate: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, metricsRes] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/dashboard/performance')
      ]);
      setStats(statsRes.data.stats);
      setRecentActivity(statsRes.data.recentActivity);
      setPerformanceMetrics(metricsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Platform Management & System Overview</p>
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon="users"
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12% from last month"
          trend="up"
        />
        <StatCard
          icon="shield"
          label="Active Admins"
          value={stats.activeAdmins}
          change="+3 this week"
          trend="up"
        />
        <StatCard
          icon="clipboard"
          label="Pending Requests"
          value={stats.pendingRequests}
          change="-5 from yesterday"
          trend="down"
        />
        <StatCard
          icon="chart-line"
          label="Today's Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+8% from yesterday"
          trend="up"
        />
      </div>

      <div className="dashboard-grid-2">
        <Card>
          <PerformanceMetrics
            metrics={[
              { label: 'System Uptime', value: `${performanceMetrics.systemUptime}%`, icon: 'server' },
              { label: 'API Latency', value: `${performanceMetrics.apiLatency}ms`, icon: 'bolt' },
              { label: 'Error Rate', value: `${performanceMetrics.errorRate}%`, icon: 'exclamation-triangle' },
              { label: 'Active Users', value: performanceMetrics.activeUsers, icon: 'users' }
            ]}
          />
        </Card>
        <Card>
          <AnalyticsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            chart="area"
            data={[65, 75, 85, 80, 90, 95, stats.systemHealth]}
          />
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <ActivityTimeline
          title="Recent System Activity"
          activities={recentActivity.map(activity => ({
            id: activity.id,
            title: activity.description,
            time: activity.timestamp,
            icon: activity.type === 'user' ? 'user' : 'cog',
            type: activity.severity
          }))}
        />
        <QuickActions
          title="Administrative Actions"
          actions={[
            { label: 'User Management', icon: 'users', action: () => {} },
            { label: 'System Settings', icon: 'cog', action: () => {} },
            { label: 'Security Logs', icon: 'shield', action: () => {} },
            { label: 'Backup System', icon: 'database', action: () => {} }
          ]}
        />
      </div>

      <NotificationCenter
        notifications={recentActivity.slice(0, 5).map(activity => ({
          id: activity.id,
          title: activity.description,
          time: activity.timestamp,
          type: activity.severity
        }))}
      />
    </div>
  );
}
