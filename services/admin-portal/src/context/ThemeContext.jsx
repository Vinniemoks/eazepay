import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme, getAdaptiveTheme } from '../theme/colors';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('theme-brightness');
    return saved ? parseInt(saved) : 0;
  });

  const [autoAdjust, setAutoAdjust] = useState(() => {
    const saved = localStorage.getItem('theme-auto-adjust');
    return saved === 'true';
  });

  const theme = getAdaptiveTheme(mode, brightness);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('theme-brightness', brightness.toString());
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem('theme-auto-adjust', autoAdjust.toString());
  }, [autoAdjust]);

  // Auto-adjust based on time of day
  useEffect(() => {
    if (!autoAdjust) return;
    
    const adjustByTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setBrightness(10);
      else if (hour >= 12 && hour < 18) setBrightness(0);
      else if (hour >= 18 && hour < 22) setBrightness(-10);
      else setBrightness(-20);
    };
    
    adjustByTime();
    const interval = setInterval(adjustByTime, 60000);
    return () => clearInterval(interval);
  }, [autoAdjust]);

  const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode, brightness, setBrightness, autoAdjust, setAutoAdjust }}>
      {children}
    </ThemeContext.Provider>
  );
};
