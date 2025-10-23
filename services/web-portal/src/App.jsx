import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme, useSystemTheme } from './shared/theme';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

export default function App() {
  const systemTheme = useSystemTheme();
  const [mode, setMode] = useState(systemTheme);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Landing toggleTheme={toggleTheme} />} />
          <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}