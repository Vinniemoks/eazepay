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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeVisitors: 0,
    conversionRate: 0,
    avgSessionTime: 0,
    totalSignups: 0,
    pageViews: 0
  });
  const [analytics, setAnalytics] = useState({
    trafficSources: [],
    popularPages: [],
    deviceTypes: [],
    conversions: []
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get('/api/web/dashboard/stats'),
        axios.get('/api/web/dashboard/analytics')
      ]);
      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data);
      setRecentActivity(statsRes.data.recentActivity);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Web Analytics Dashboard</h1>
        <p>Real-time Website Performance & User Insights</p>
      </div>

      <div className="dashboard-grid">
        <StatCard
          icon="users"
          label="Active Visitors"
          value={stats.activeVisitors}
          change="+15% from last hour"
          trend="up"
        />
        <StatCard
          icon="chart-line"
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="+2.5% from yesterday"
          trend="up"
        />
        <StatCard
          icon="clock"
          label="Avg. Session Time"
          value={`${stats.avgSessionTime}m`}
          change="+1m from last week"
          trend="up"
        />
        <StatCard
          icon="user-plus"
          label="Total Signups"
          value={stats.totalSignups.toLocaleString()}
          change="+25 today"
          trend="up"
        />
      </div>

      <div className="dashboard-grid-2">
        <AnalyticsCard
          title="Traffic Sources"
          chart="doughnut"
          data={analytics.trafficSources}
          legend={true}
        />
        <AnalyticsCard
          title="Page Views Trend"
          value={stats.pageViews.toLocaleString()}
          chart="area"
          data={analytics.conversions}
        />
      </div>

      <div className="dashboard-grid-2">
        <Card>
          <SummaryWidget
            title="Popular Pages"
            items={analytics.popularPages.map(page => ({
              label: page.url,
              value: page.views.toLocaleString(),
              change: page.change
            }))}
          />
        </Card>
        <Card>
          <SummaryWidget
            title="Device Types"
            items={analytics.deviceTypes.map(device => ({
              label: device.type,
              value: `${device.percentage}%`,
              icon: device.type.toLowerCase()
            }))}
          />
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <ActivityTimeline
          title="Recent Activity"
          activities={recentActivity.map(activity => ({
            id: activity.id,
            title: activity.description,
            time: activity.timestamp,
            icon: activity.type,
            type: activity.category
          }))}
        />
        <QuickActions
          title="Quick Actions"
          actions={[
            { label: 'Export Report', icon: 'file-export', action: () => {} },
            { label: 'Update Content', icon: 'edit', action: () => {} },
            { label: 'View Heatmap', icon: 'fire', action: () => {} },
            { label: 'Configure SEO', icon: 'search', action: () => {} }
          ]}
        />
      </div>

      <NotificationCenter
        notifications={recentActivity.slice(0, 5).map(activity => ({
          id: activity.id,
          title: activity.description,
          time: activity.timestamp,
          type: activity.category
        }))}
      />
    </div>
  );
}