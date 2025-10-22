import React, { useEffect, useRef, useState } from 'react';
import { Card, SectionHeader, Badge, ProgressBar, Loader } from './ui';
import { generateGradient } from '../utils/theme';
import '../styles/animations.css';

// Stat Card with Enhanced Animations
export const StatCard = ({ icon, label, value, change, trend, loading }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Card 
      ref={cardRef}
      className={`stat-card hover-lift ${isVisible ? 'fade-in' : ''}`}
    >
      {loading ? (
        <div className="loading-shimmer">
          <Loader size={30} />
        </div>
      ) : (
        <>
          <div className={`stat-icon pulse ${icon}`}>{icon}</div>
          <div className="stat-content">
            <h3 className="slide-in-right">{label}</h3>
            <div className={`stat-card-value ${trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : ''}`}>
              {value}
            </div>
            {change && (
              <Badge 
                variant={trend === 'up' ? 'success' : 'error'}
                className="trend-badge fade-in-scale"
              >
                {trend === 'up' ? '↑' : '↓'} {change}
              </Badge>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

// Activity Timeline
export const ActivityTimeline = ({ activities }) => (
  <div className="activity-timeline">
    {activities.map((activity, index) => (
      <div key={index} className="timeline-item">
        <div className="timeline-icon" style={{
          background: generateGradient(activity.iconColor, activity.iconColorEnd)
        }}>
          {activity.icon}
        </div>
        <div className="timeline-content">
          <h4>{activity.title}</h4>
          <p>{activity.description}</p>
          <span className="timeline-time">{activity.time}</span>
        </div>
      </div>
    ))}
  </div>
);

// Analytics Chart Card
export const AnalyticsCard = ({ title, chart, filters }) => (
  <Card className="analytics-card">
    <div className="analytics-header">
      <h3>{title}</h3>
      <div className="analytics-filters">
        {filters.map((filter, index) => (
          <button 
            key={index} 
            className={`filter-btn ${filter.active ? 'active' : ''}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
    <div className="analytics-chart">
      {chart}
    </div>
  </Card>
);

// Quick Actions Panel
export const QuickActions = ({ actions }) => (
  <div className="quick-actions">
    {actions.map((action, index) => (
      <button 
        key={index}
        className="action-btn"
        onClick={action.onClick}
        style={{
          background: generateGradient(action.color, action.colorEnd)
        }}
      >
        <span className="action-icon">{action.icon}</span>
        <span className="action-label">{action.label}</span>
      </button>
    ))}
  </div>
);

// Performance Metrics
export const PerformanceMetrics = ({ metrics }) => (
  <Card className="performance-metrics">
    <h3>Performance Metrics</h3>
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-item">
          <div className="metric-header">
            <span>{metric.label}</span>
            <Badge variant={metric.status}>{metric.statusText}</Badge>
          </div>
          <ProgressBar progress={metric.progress} />
          <div className="metric-footer">
            <span className="metric-value">{metric.value}</span>
            <span className="metric-target">Target: {metric.target}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Notification Center
export const NotificationCenter = ({ notifications }) => (
  <div className="notification-center">
    {notifications.map((notification, index) => (
      <div key={index} className={`notification-item ${notification.read ? '' : 'unread'}`}>
        <div className="notification-icon" style={{
          background: generateGradient(notification.color, notification.colorEnd)
        }}>
          {notification.icon}
        </div>
        <div className="notification-content">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <span className="notification-time">{notification.time}</span>
        </div>
      </div>
    ))}
  </div>
);

// Summary Widget
export const SummaryWidget = ({ title, data, chart, loading }) => (
  <Card className="summary-widget">
    {loading ? (
      <Loader size={40} />
    ) : (
      <>
        <div className="widget-header">
          <h3>{title}</h3>
          {data.trend && (
            <Badge 
              variant={data.trend > 0 ? 'success' : 'error'}
              className="trend-badge"
            >
              {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
            </Badge>
          )}
        </div>
        <div className="widget-value">{data.value}</div>
        <div className="widget-chart">{chart}</div>
        {data.breakdown && (
          <div className="widget-breakdown">
            {data.breakdown.map((item, index) => (
              <div key={index} className="breakdown-item">
                <span className="breakdown-label">{item.label}</span>
                <span className="breakdown-value">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </Card>
);