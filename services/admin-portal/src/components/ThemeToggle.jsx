import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { mode, toggleMode, brightness, setBrightness, autoAdjust, setAutoAdjust, theme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const styles = {
    container: {
      position: 'relative',
    },
    button: {
      background: theme.background.paper,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.text.primary,
      transition: 'all 0.3s ease',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      background: theme.background.elevated,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '16px',
      minWidth: '280px',
      boxShadow: `0 8px 24px ${theme.shadow}`,
      zIndex: 1000,
    },
    section: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    modeButtons: {
      display: 'flex',
      gap: '8px',
    },
    modeButton: (active) => ({
      flex: 1,
      padding: '8px',
      border: `2px solid ${active ? theme.primary : theme.border}`,
      borderRadius: '8px',
      background: active ? `${theme.primary}15` : 'transparent',
      color: active ? theme.primary : theme.text.secondary,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    }),
    slider: {
      width: '100%',
      height: '6px',
      borderRadius: '3px',
      background: theme.border,
      outline: 'none',
      cursor: 'pointer',
    },
    sliderValue: {
      textAlign: 'center',
      fontSize: '14px',
      color: theme.text.primary,
      marginTop: '8px',
      fontWeight: '600',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={() => setShowSettings(!showSettings)}>
        {mode === 'light' ? '☀️' : '🌙'}
        <span>Theme</span>
      </button>

      {showSettings && (
        <div style={styles.dropdown}>
          <div style={styles.section}>
            <label style={styles.label}>Mode</label>
            <div style={styles.modeButtons}>
              <button
                style={styles.modeButton(mode === 'light')}
                onClick={() => toggleMode()}
              >
                ☀️ Light
              </button>
              <button
                style={styles.modeButton(mode === 'dark')}
                onClick={() => toggleMode()}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Brightness</label>
            <input
              type="range"
              min="-30"
              max="30"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderValue}>
              {brightness > 0 ? `+${brightness}` : brightness}
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={autoAdjust}
                onChange={(e) => setAutoAdjust(e.target.checked)}
              />
              <span style={{ color: theme.text.primary, fontSize: '14px' }}>
                Auto-adjust by time
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
