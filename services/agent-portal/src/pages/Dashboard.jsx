import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  StatCard,
  ActivityTimeline,
  AnalyticsCard,
  QuickActions,
  PerformanceMetrics,
  NotificationCenter,
  SummaryWidget
} from '../../../shared/components/dashboard';
import { Card } from '../../../shared/components/ui';
import '../../../shared/styles/dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayTransactions: 0,
    totalCommission: 0,
    activeCustomers: 0,
    performance: 0,
    chartData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/agent/dashboard');
      setDashboardData({
        todayTransactions: res.data.stats.totalTransactions,
        totalCommission: res.data.stats.totalCommission,
        activeCustomers: res.data.stats.activeCustomers,
        performance: 92,
        chartData: res.data.chartData
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'New Customer',
      icon: '👥',
      color: '#DAA520',
      colorEnd: '#8344FF',
      onClick: () => {}
    },
    {
      label: 'Cash Transfer',
      icon: '💰',
      color: '#8344FF',
      colorEnd: '#3B82F6',
      onClick: () => {}
    },
    {
      label: 'Bill Payment',
      icon: '📄',
      color: '#3B82F6',
      colorEnd: '#DAA520',
      onClick: () => {}
    },
    {
      label: 'Reports',
      icon: '📊',
      color: '#DAA520',
      colorEnd: '#3B82F6',
      onClick: () => {}
    }
  ];

  const performanceMetrics = [
    {
      label: 'Success Rate',
      progress: 92,
      value: '92%',
      target: '95%',
      status: 'success',
      statusText: 'Excellent'
    },
    {
      label: 'Customer Satisfaction',
      progress: 88,
      value: '4.4/5',
      target: '4.5/5',
      status: 'success',
      statusText: 'Very Good'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <h1 className="section-header">Agent Command Center</h1>
        <p>Monitor your performance and serve customers efficiently</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          icon="📊"
          title="Today's Transactions"
          value={dashboardData.todayTransactions}
          trend={8}
          loading={loading}
        />
        <StatCard
          icon="💰"
          title="Total Commission"
          value={`$${dashboardData.totalCommission.toFixed(2)}`}
          trend={15}
          loading={loading}
        />
        <StatCard
          icon="👥"
          title="Active Customers"
          value={dashboardData.activeCustomers}
          trend={5}
          loading={loading}
        />
        <StatCard
          icon="⭐"
          title="Performance Score"
          value={`${dashboardData.performance}%`}
          trend={3}
          loading={loading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          <QuickActions actions={quickActions} />
          <AnalyticsCard
            title="Transaction Analytics"
            chart={
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#DAA520" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            }
            filters={[
              { label: 'Today', active: true },
              { label: 'Week', active: false },
              { label: 'Month', active: false }
            ]}
          />
          <SummaryWidget
            title="Commission Overview"
            data={{
              value: `$${dashboardData.totalCommission.toFixed(2)}`,
              trend: 15,
              breakdown: [
                { label: 'Today', value: '$250.50' },
                { label: 'This Week', value: '$875.25' },
                { label: 'This Month', value: '$3,250.75' }
              ]
            }}
            loading={loading}
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <PerformanceMetrics metrics={performanceMetrics} />
          <Card className="recent-activity">
            <h3>Recent Activity</h3>
            <ActivityTimeline
              activities={[
                {
                  icon: '💰',
                  iconColor: '#DAA520',
                  iconColorEnd: '#8344FF',
                  title: 'Cash Transfer',
                  description: 'Transfer completed for John D.',
                  time: '10 minutes ago'
                },
                {
                  icon: '👥',
                  iconColor: '#8344FF',
                  iconColorEnd: '#3B82F6',
                  title: 'New Customer',
                  description: 'Sarah M. registered successfully',
                  time: '1 hour ago'
                },
                {
                  icon: '📄',
                  iconColor: '#3B82F6',
                  iconColorEnd: '#DAA520',
                  title: 'Bill Payment',
                  description: 'Utility bill payment processed',
                  time: '2 hours ago'
                }
              ]}
            />
          </Card>
          <Card>
            <NotificationCenter
              notifications={[
                {
                  title: 'Performance Review',
                  message: 'Your monthly performance review is available',
                  time: '1 hour ago',
                  icon: '📈',
                  color: '#DAA520',
                  colorEnd: '#8344FF',
                  read: false
                },
                {
                  title: 'Commission Payout',
                  message: 'Your weekly commission has been processed',
                  time: '3 hours ago',
                  icon: '💰',
                  color: '#8344FF',
                  colorEnd: '#3B82F6',
                  read: true
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>Transaction Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="transactions" stroke="#007bff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
