import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import '../../../shared/styles/animations.css';
import '../../../shared/styles/dashboard-animations.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    monthlySpending: 0,
    savings: 0,
    rewards: 0,
    recentTransactions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes, savingsRes, rewardsRes] = await Promise.all([
        axios.get('/api/wallet/balance'),
        axios.get('/api/transactions/recent'),
        axios.get('/api/savings/total'),
        axios.get('/api/rewards/points')
      ]);

      setDashboardData({
        balance: walletRes.data.balance,
        monthlySpending: txRes.data.monthlyTotal || 0,
        savings: savingsRes.data.total || 0,
        rewards: rewardsRes.data.points || 0,
        recentTransactions: txRes.data.transactions || []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'Send Money',
      icon: '💸',
      color: '#DAA520',
      colorEnd: '#8344FF',
      onClick: () => {}
    },
    {
      label: 'Pay Bills',
      icon: '📋',
      color: '#8344FF',
      colorEnd: '#3B82F6',
      onClick: () => {}
    },
    {
      label: 'Top Up',
      icon: '📱',
      color: '#3B82F6',
      colorEnd: '#DAA520',
      onClick: () => {}
    },
    {
      label: 'Invest',
      icon: '📈',
      color: '#DAA520',
      colorEnd: '#3B82F6',
      onClick: () => {}
    }
  ];

  const metrics = [
    {
      label: 'Savings Goal',
      progress: 75,
      value: `$${dashboardData.savings.toFixed(2)}`,
      target: '$15,000',
      status: 'success',
      statusText: 'On Track'
    },
    {
      label: 'Budget Usage',
      progress: 60,
      value: `$${dashboardData.monthlySpending.toFixed(2)}`,
      target: '$7,500',
      status: 'success',
      statusText: 'Under Budget'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <h1 className="section-header">Welcome to Your Financial Hub</h1>
        <p>Your money, intelligently managed</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          icon="💰"
          title="Available Balance"
          value={`$${dashboardData.balance.toFixed(2)}`}
          loading={loading}
        />
        <StatCard
          icon="📊"
          title="Monthly Spending"
          value={`$${dashboardData.monthlySpending.toFixed(2)}`}
          trend={-12}
          loading={loading}
        />
        <StatCard
          icon="🎯"
          title="Total Savings"
          value={`$${dashboardData.savings.toFixed(2)}`}
          trend={15}
          loading={loading}
        />
        <StatCard
          icon="⭐"
          title="Reward Points"
          value={dashboardData.rewards}
          trend={5}
          loading={loading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          <QuickActions actions={quickActions} />
          <AnalyticsCard
            title="Spending Analytics"
            chart={<div className="chart-placeholder">Chart Component</div>}
            filters={[
              { label: 'Weekly', active: false },
              { label: 'Monthly', active: true },
              { label: 'Yearly', active: false }
            ]}
          />
          <SummaryWidget
            title="Savings Progress"
            data={{
              value: `$${dashboardData.savings.toFixed(2)}`,
              trend: 15,
              breakdown: [
                { label: 'This Month', value: '$2,500' },
                { label: 'Last Month', value: '$2,100' },
                { label: 'Growth', value: '+19%' }
              ]
            }}
            loading={loading}
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <PerformanceMetrics metrics={metrics} />
          <Card className="recent-activity">
            <h3>Recent Activity</h3>
            <ActivityTimeline
              activities={dashboardData.recentTransactions.map(tx => ({
                icon: tx.type === 'credit' ? '↓' : '↑',
                iconColor: tx.type === 'credit' ? '#22C55E' : '#8344FF',
                iconColorEnd: '#3B82F6',
                title: tx.description,
                description: `${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}`,
                time: new Date(tx.timestamp).toLocaleDateString()
              }))}
            />
          </Card>
          <Card>
            <NotificationCenter
              notifications={[
                {
                  title: 'Bill Payment Due',
                  message: 'Your electricity bill payment is due in 3 days',
                  time: '2 hours ago',
                  icon: '⚡',
                  color: '#DAA520',
                  colorEnd: '#8344FF',
                  read: false
                },
                {
                  title: 'Savings Goal Achieved',
                  message: "Congratulations! You've reached your monthly savings goal",
                  time: '1 day ago',
                  icon: '🎉',
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
}
