import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StatCard,
  ActivityTimeline,
  QuickActions,
  PerformanceMetrics
} from '../../../shared/components/dashboard';
import { Card } from '../../../shared/components/ui';
import '../../../shared/styles/dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 12458,
    activeAdmins: 24,
    pendingRequests: 18,
    todayTransactions: 3542,
    systemHealth: 98,
    totalRevenue: 125840
  });
  
  const [recentActivity] = useState([
    {
      id: 1,
      title: 'New admin user created: John Smith',
      description: 'Admin account created with full permissions',
      time: '5 minutes ago',
      icon: '👤',
      iconColor: '#DAA520',
      iconColorEnd: '#8344FF'
    },
    {
      id: 2,
      title: 'System backup completed successfully',
      description: 'Daily backup completed without errors',
      time: '15 minutes ago',
      icon: '✅',
      iconColor: '#10B981',
      iconColorEnd: '#059669'
    },
    {
      id: 3,
      title: 'Security alert: Multiple failed login attempts',
      description: 'IP address 192.168.1.100 blocked',
      time: '1 hour ago',
      icon: '⚠️',
      iconColor: '#F59E0B',
      iconColorEnd: '#D97706'
    },
    {
      id: 4,
      title: 'Database optimization completed',
      description: 'Performance improved by 15%',
      time: '2 hours ago',
      icon: '🔧',
      iconColor: '#8344FF',
      iconColorEnd: '#3B82F6'
    },
    {
      id: 5,
      title: 'New permission role created: Auditor',
      description: 'Read-only access to audit logs',
      time: '3 hours ago',
      icon: '🔐',
      iconColor: '#DAA520',
      iconColorEnd: '#8344FF'
    }
  ]);

  const [performanceMetrics] = useState({
    systemUptime: 99.98,
    apiLatency: 45,
    errorRate: 0.02,
    activeUsers: 8234
  });

  useEffect(() => {
    // Try to fetch real data, but use mock data if it fails
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.log('Using mock data - API not available');
    }
  };

  const quickActions = [
    {
      label: 'User Management',
      icon: '👥',
      color: '#DAA520',
      colorEnd: '#8344FF',
      onClick: () => window.location.href = '/users'
    },
    {
      label: 'System Settings',
      icon: '⚙️',
      color: '#8344FF',
      colorEnd: '#3B82F6',
      onClick: () => window.location.href = '/organization'
    },
    {
      label: 'Security Logs',
      icon: '🔒',
      color: '#3B82F6',
      colorEnd: '#DAA520',
      onClick: () => window.location.href = '/audit-logs'
    },
    {
      label: 'Analytics',
      icon: '📊',
      color: '#DAA520',
      colorEnd: '#3B82F6',
      onClick: () => window.location.href = '/analytics'
    }
  ];

  const performanceMetricsList = [
    {
      label: 'System Uptime',
      progress: performanceMetrics.systemUptime,
      value: `${performanceMetrics.systemUptime}%`,
      target: '99.9%',
      status: 'success',
      statusText: 'Excellent'
    },
    {
      label: 'API Response Time',
      progress: 95,
      value: `${performanceMetrics.apiLatency}ms`,
      target: '< 100ms',
      status: 'success',
      statusText: 'Optimal'
    },
    {
      label: 'Error Rate',
      progress: 99.98,
      value: `${performanceMetrics.errorRate}%`,
      target: '< 0.1%',
      status: 'success',
      statusText: 'Excellent'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <h1 className="section-header">Admin Command Center</h1>
        <p>Monitor platform health, manage users, and oversee system operations</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12%"
          trend="up"
          loading={loading}
        />
        <StatCard
          icon="👑"
          label="Active Admins"
          value={stats.activeAdmins}
          change="+3"
          trend="up"
          loading={loading}
        />
        <StatCard
          icon="📋"
          label="Pending Requests"
          value={stats.pendingRequests}
          change="-5"
          trend="down"
          loading={loading}
        />
        <StatCard
          icon="💰"
          label="Today's Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+8%"
          trend="up"
          loading={loading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          <QuickActions actions={quickActions} />
          
          <Card className="system-health-card" style={{padding: '1.5rem'}}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700'}}>System Health Overview</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                  ✓
                </div>
                <div style={{flex: 1}}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem'}}>All Systems Operational</h4>
                  <p style={{fontSize: '0.875rem', color: '#737373'}}>No critical issues detected</p>
                </div>
                <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#10B981'}}>{stats.systemHealth}%</div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #DAA520, #8344FF)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                  👥
                </div>
                <div style={{flex: 1}}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem'}}>Active Users</h4>
                  <p style={{fontSize: '0.875rem', color: '#737373'}}>Currently online</p>
                </div>
                <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#DAA520'}}>{performanceMetrics.activeUsers.toLocaleString()}</div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #8344FF, #3B82F6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                  ⚡
                </div>
                <div style={{flex: 1}}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem'}}>API Performance</h4>
                  <p style={{fontSize: '0.875rem', color: '#737373'}}>Average response time</p>
                </div>
                <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#8344FF'}}>{performanceMetrics.apiLatency}ms</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <PerformanceMetrics metrics={performanceMetricsList} />
          
          <Card className="recent-activity" style={{padding: '1.5rem'}}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700'}}>System Activity Log</h3>
            <ActivityTimeline activities={recentActivity} />
          </Card>
        </div>
      </div>
    </div>
  );
}
