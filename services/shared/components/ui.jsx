import React from 'react';
import { themeConfig } from '../theme/config';

// Button Components
export const Button = ({ variant = 'primary', children, ...props }) => (
  <button 
    className={`btn-${variant}`} 
    {...props}
  >
    {children}
  </button>
);

// Card Component
export const Card = ({ children, hover = true, ...props }) => (
  <div 
    className={`card ${hover ? 'hover' : ''}`}
    {...props}
  >
    {children}
  </div>
);

// Input Field Component
export const Input = ({ ...props }) => (
  <input 
    className="input-field"
    {...props}
  />
);

// Navigation Item Component
export const NavItem = ({ active, children, ...props }) => (
  <div 
    className={`nav-item ${active ? 'active' : ''}`}
    {...props}
  >
    {children}
  </div>
);

// Section Header Component
export const SectionHeader = ({ children, ...props }) => (
  <h2 
    className="section-header"
    {...props}
  >
    {children}
  </h2>
);

// Table Components
export const Table = ({ children, ...props }) => (
  <table 
    className="table"
    {...props}
  >
    {children}
  </table>
);

// Badge Component
export const Badge = ({ variant = 'success', children, ...props }) => (
  <span 
    className={`badge badge-${variant}`}
    {...props}
  >
    {children}
  </span>
);

// Loader Component
export const Loader = ({ size = 40, ...props }) => (
  <div 
    className="loader"
    style={{ width: size, height: size }}
    {...props}
  />
);

// Progress Bar Component
export const ProgressBar = ({ progress, ...props }) => (
  <div 
    className="progress-bar"
    {...props}
  >
    <div 
      className="progress-bar-fill"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Tooltip Component
export const Tooltip = ({ text, children, ...props }) => (
  <div 
    className="tooltip"
    data-tooltip={text}
    {...props}
  >
    {children}
  </div>
);

// Modal Components
export const Modal = ({ title, children, onClose, ...props }) => (
  <div className="modal" {...props}>
    <div className="modal-header">
      {title}
      <button onClick={onClose}>&times;</button>
    </div>
    <div className="modal-content">
      {children}
    </div>
  </div>
);

// Animated Container Component
export const AnimatedContainer = ({ children, ...props }) => (
  <div 
    className="animate-fade-in"
    {...props}
  >
    {children}
  </div>
);