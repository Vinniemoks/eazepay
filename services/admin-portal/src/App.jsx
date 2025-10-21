import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Permissions from './pages/Permissions';
import AccessRequests from './pages/AccessRequests';
import Organization from './pages/Organization';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';

function AppContent() {
  const { theme } = useTheme();
  const [user, setUser] = React.useState(null);
  const isAuthenticated = !!user;

  React.useEffect(() => {
    // Load user from localStorage or API
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const styles = {
    app: {
      background: theme.background.default,
      minHeight: '100vh',
      color: theme.text.primary,
      transition: 'all 0.3s ease',
    },
    layout: {
      display: 'flex',
    },
    main: {
      marginLeft: '260px',
      marginTop: '70px',
      flex: 1,
      minHeight: 'calc(100vh - 70px)',
    },
  };

  if (!isAuthenticated) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div style={styles.app}>
      <BrowserRouter>
        <div style={styles.layout}>
          <Sidebar userRole={user?.role} />
          <div style={{ flex: 1 }}>
            <Header user={user} />
            <main style={styles.main}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/access-requests" element={<AccessRequests />} />
                <Route path="/organization" element={<Organization />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
