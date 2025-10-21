import React, { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { SendMoney } from './components/SendMoney';
import { Transactions } from './components/Transactions';
import './App.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

type View = 'dashboard' | 'send' | 'transactions' | 'settings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();

    // Listen for logout event from main process
    window.electron.on('logout', handleLogout);
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await window.electron.store.get('user');
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData: User) => {
    await window.electron.store.set('user', userData);
    setUser(userData);
  };

  const handleLogout = async () => {
    await window.electron.store.clear();
    setUser(null);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Eazepay...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Eazepay</h1>
          <p>{user.fullName}</p>
        </div>
        <nav className="sidebar-nav">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentView === 'send' ? 'active' : ''}
            onClick={() => setCurrentView('send')}
          >
            Send Money
          </button>
          <button
            className={currentView === 'transactions' ? 'active' : ''}
            onClick={() => setCurrentView('transactions')}
          >
            Transactions
          </button>
          <button
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'send' && <SendMoney />}
        {currentView === 'transactions' && <Transactions />}
        {currentView === 'settings' && <div>Settings (Coming Soon)</div>}
      </main>
    </div>
  );
}

export default App;
