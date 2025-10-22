import React from 'react';
import '../styles/premium-visuals.css';

export const PremiumStatistic = ({ icon, value, label, trend }) => (
  <div className="premium-stat fade-in">
    <div className="premium-stat-icon">{icon}</div>
    <div className="premium-stat-value gradient-shift">{value}</div>
    <div className="premium-stat-label">{label}</div>
    {trend && (
      <div className={`premium-stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

export const TransactionCard = ({ transaction }) => (
  <div className="premium-card hover-lift">
    <div className="transaction-header">
      <div className="transaction-icon">
        <i className={`fa fa-${transaction.type === 'incoming' ? 'arrow-down' : 'arrow-up'}`} />
      </div>
      <div className="transaction-amount">
        <span className="currency">$</span>
        {transaction.amount.toLocaleString()}
      </div>
    </div>
    <div className="elegant-divider" />
    <div className="transaction-details">
      <div className="transaction-info">
        <span className="label">Reference</span>
        <span className="value">{transaction.reference}</span>
      </div>
      <div className="transaction-info">
        <span className="label">Status</span>
        <span className={`status-indicator status-${transaction.status.toLowerCase()}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  </div>
);

export const PremiumMetricCard = ({ title, value, change, chart }) => (
  <div className="premium-card metric-card hover-lift">
    <div className="metric-header">
      <h3 className="premium-title">{title}</h3>
      {change && (
        <div className={`metric-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
    <div className="metric-value gradient-shift">{value}</div>
    {chart && (
      <div className="metric-chart">
        {/* Chart Component */}
        {chart}
      </div>
    )}
  </div>
);

export const ActivityStream = ({ activities }) => (
  <div className="premium-card activity-stream hover-lift">
    <h3 className="premium-title">Recent Activity</h3>
    <div className="elegant-divider" />
    <ul className="premium-list premium-scrollbar">
      {activities.map((activity) => (
        <li key={activity.id} className="premium-list-item fade-in">
          <div className="activity-icon">
            <i className={`fa fa-${activity.icon}`} />
          </div>
          <div className="activity-content">
            <div className="activity-title">{activity.title}</div>
            <div className="activity-time">{activity.time}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export const PremiumDataTable = ({ columns, data, onRowClick }) => (
  <div className="premium-card table-container">
    <table className="premium-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className="hover-lift"
          >
            {columns.map((column) => (
              <td key={`${row.id}-${column.key}`}>
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const PerformanceWidget = ({ metrics }) => (
  <div className="premium-card performance-widget hover-lift">
    <h3 className="premium-title">System Performance</h3>
    <div className="elegant-divider" />
    {metrics.map((metric) => (
      <div key={metric.label} className="performance-metric fade-in">
        <div className="metric-label">{metric.label}</div>
        <div className="premium-progress">
          <div
            className="premium-progress-bar gradient-shift"
            style={{ width: `${metric.value}%` }}
          />
        </div>
        <div className="metric-value">{metric.value}%</div>
      </div>
    ))}
  </div>
);

export const QuickAction = ({ icon, label, onClick }) => (
  <button className="premium-button hover-lift" onClick={onClick}>
    <i className={`fa fa-${icon}`} />
    <span>{label}</span>
  </button>
);

export const AlertBanner = ({ type, message }) => (
  <div className={`premium-alert premium-alert-${type}`}>
    <div className="alert-content">
      <i className={`fa fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
      <span>{message}</span>
    </div>
  </div>
);