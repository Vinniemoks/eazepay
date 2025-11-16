import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterCustomer from './pages/RegisterCustomer';
import VerifyCustomer from './pages/VerifyCustomer';
import CashTransactions from './pages/CashTransactions';
import AgentProfile from './pages/AgentProfile';
import Help from './pages/Help';
import AgentLayout from './components/AgentLayout';
import ErrorBoundary from './components/ErrorBoundary';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  console.log('App component rendering...');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AgentLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="register" element={<RegisterCustomer />} />
              <Route path="verify" element={<VerifyCustomer />} />
              <Route path="transactions" element={<CashTransactions />} />
              <Route path="profile" element={<AgentProfile />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
