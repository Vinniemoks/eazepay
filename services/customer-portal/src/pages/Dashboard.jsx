import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StatCard,
  ActivityTimeline,
  QuickActions,
  PerformanceMetrics,
  NotificationCenter
} from '../../../shared/components/dashboard';
import { Card } from '../../../shared/components/ui';
import '../../../shared/styles/dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    balance: 5420.50,
    monthlySpending: 2340.75,
    savings: 11250.00,
    rewards: 1250,
    recentTransactions: [
      {
        id: 1,
        type: 'debit',
        description: 'Grocery Shopping - SuperMart',
        amount: 125.50,
        timestamp: new Date().toISOString(),
        icon: '🛒',
        iconColor: '#EF4444',
        iconColorEnd: '#DC2626'
      },
      {
        id: 2,
        type: 'credit',
        description: 'Salary Payment',
        amount: 3500.00,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        icon: '💰',
        iconColor: '#10B981',
        iconColorEnd: '#059669'
      },
      {
        id: 3,
        type: 'debit',
        description: 'Electricity Bill Payment',
        amount: 85.00,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        icon: '⚡',
        iconColor: '#F59E0B',
        iconColorEnd: '#D97706'
      },
      {
        id: 4,
        type: 'debit',
        description: 'Mobile Airtime Top-up',
        amount: 20.00,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        icon: '📱',
        iconColor: '#8344FF',
        iconColorEnd: '#6B2FE0'
      },
      {
        id: 5,
        type: 'credit',
        description: 'Refund - Online Purchase',
        amount: 45.25,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        icon: '↩️',
        iconColor: '#3B82F6',
        iconColorEnd: '#2563EB'
      }
    ]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/wallet/balance');
      setDashboardData(prev => ({
        ...prev,
        balance: response.data.balance
      }));
    } catch (error) {
      console.log('Using mock data - API not available');
    }
  };

  const quickActions = [
    {
      label: 'Send Money',
      icon: '💸',
      color: '#DAA520',
      colorEnd: '#8344FF',
      onClick: () => window.location.href = '/wallet'
    },
    {
      label: 'Pay Bills',
      icon: '📋',
      color: '#8344FF',
      colorEnd: '#3B82F6',
      onClick: () => window.location.href = '/transactions'
    },
    {
      label: 'Buy Airtime',
      icon: '📱',
      color: '#3B82F6',
      colorEnd: '#DAA520',
      onClick: () => window.location.href = '/wallet'
    },
    {
      label: 'View History',
      icon: '📊',
      color: '#DAA520',
      colorEnd: '#3B82F6',
      onClick: () => window.location.href = '/transactions'
    }
  ];

  const metrics = [
    {
      label: 'Savings Goal Progress',
      progress: 75,
      value: `$${dashboardData.savings.toLocaleString()}`,
      target: '$15,000',
      status: 'success',
      statusText: 'On Track'
    },
    {
      label: 'Monthly Budget',
      progress: 60,
      value: `$${dashboardData.monthlySpending.toLocaleString()}`,
      target: '$4,000',
      status: 'success',
      statusText: 'Under Budget'
    }
  ];

  const notifications = [
    {
      title: 'Bill Payment Reminder',
      message: 'Your electricity bill payment is due in 3 days',
      time: '2 hours ago',
      icon: '⚡',
      color: '#F59E0B',
      colorEnd: '#D97706',
      read: false
    },
    {
      title: 'Savings Milestone',
      message: "Congratulations! You've reached 75% of your savings goal",
      time: '1 day ago',
      icon: '🎯',
      color: '#10B981',
      colorEnd: '#059669',
      read: false
    },
    {
      title: 'New Reward Points',
      message: 'You earned 50 reward points from your recent transactions',
      time: '2 days ago',
      icon: '⭐',
      color: '#DAA520',
      colorEnd: '#8344FF',
      read: true
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <h1 className="section-header">Welcome Back! 👋</h1>
        <p>Here's what's happening with your money today</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          icon="💰"
          label="Available Balance"
          value={`$${dashboardData.balance.toLocaleString()}`}
          change="+5.2%"
          trend="up"
          loading={loading}
        />
        <StatCard
          icon="📊"
          label="This Month's Spending"
          value={`$${dashboardData.monthlySpending.toLocaleString()}`}
          change="-12%"
          trend="down"
          loading={loading}
        />
        <StatCard
          icon="🎯"
          label="Total Savings"
          value={`$${dashboardData.savings.toLocaleString()}`}
          change="+15%"
          trend="up"
          loading={loading}
        />
        <StatCard
          icon="⭐"
          label="Reward Points"
          value={dashboardData.rewards.toLocaleString()}
          change="+50"
          trend="up"
          loading={loading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          <QuickActions actions={quickActions} />
          
          <Card style={{padding: '1.5rem'}}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700'}}>Spending Overview</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                    🛒
                  </div>
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '600'}}>Shopping</h4>
                    <p style={{fontSize: '0.875rem', color: '#737373'}}>35% of budget</p>
                  </div>
                </div>
                <span style={{fontSize: '1.25rem', fontWeight: '700', color: '#EF4444'}}>$820</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                    🏠
                  </div>
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '600'}}>Bills & Utilities</h4>
                    <p style={{fontSize: '0.875rem', color: '#737373'}}>25% of budget</p>
                  </div>
                </div>
                <span style={{fontSize: '1.25rem', fontWeight: '700', color: '#F59E0B'}}>$585</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #8344FF, #6B2FE0)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                    🍔
                  </div>
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '600'}}>Food & Dining</h4>
                    <p style={{fontSize: '0.875rem', color: '#737373'}}>20% of budget</p>
                  </div>
                </div>
                <span style={{fontSize: '1.25rem', fontWeight: '700', color: '#8344FF'}}>$468</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FAFAFA', borderRadius: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
                    🚗
                  </div>
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '600'}}>Transportation</h4>
                    <p style={{fontSize: '0.875rem', color: '#737373'}}>20% of budget</p>
                  </div>
                </div>
                <span style={{fontSize: '1.25rem', fontWeight: '700', color: '#3B82F6'}}>$468</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <PerformanceMetrics metrics={metrics} />
          
          <Card className="recent-activity" style={{padding: '1.5rem'}}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700'}}>Recent Transactions</h3>
            <ActivityTimeline
              activities={dashboardData.recentTransactions.map(tx => ({
                icon: tx.icon,
                iconColor: tx.iconColor,
                iconColorEnd: tx.iconColorEnd,
                title: tx.description,
                description: `${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}`,
                time: new Date(tx.timestamp).toLocaleDateString()
              }))}
            />
          </Card>
          
          <Card style={{padding: '1.5rem'}}>
            <NotificationCenter notifications={notifications} />
          </Card>
        </div>
      </div>
    </div>
  );
}
