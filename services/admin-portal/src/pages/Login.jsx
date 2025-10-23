import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import '../../../shared/styles/animations.css';

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  superadmin: {
    email: 'superadmin@afripay.com',
    password: 'SuperAdmin@2024',
    role: 'superadmin',
    name: 'Super Administrator'
  },
  admin: {
    email: 'admin@afripay.com',
    password: 'Admin@2024',
    role: 'admin',
    name: 'System Administrator'
  },
  manager: {
    email: 'manager@afripay.com',
    password: 'Manager@2024',
    role: 'manager',
    name: 'Operations Manager'
  }
};

export default function Login({ onLogin }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check demo credentials first
      const demoUser = Object.values(DEMO_CREDENTIALS).find(
        cred => cred.email === email && cred.password === password
      );

      if (demoUser) {
        console.log('Demo login successful:', demoUser.name);
        
        // Demo login successful
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          permissions: ['read', 'write', 'delete', 'manage']
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        
        console.log('User saved to localStorage:', user);
        
        // Call onLogin immediately
        setLoading(false);
        onLogin(user);
        return;
      }

      // Try API login if demo credentials don't match
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.requiresMfa) {
        setShowMfa(true);
      } else {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Try demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/verify-mfa', { email, code: mfaCode });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    const cred = DEMO_CREDENTIALS[type];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05) 0%, rgba(131, 68, 255, 0.05) 50%, rgba(0, 102, 204, 0.05) 100%)',
      padding: '20px',
      animation: 'fadeIn 0.8s ease-out forwards',
    },
    card: {
      background: 'white',
      borderRadius: '24px',
      border: '1px solid rgba(218, 165, 32, 0.1)',
      padding: '48px',
      width: '100%',
      maxWidth: '480px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(218, 165, 32, 0.15)',
      animation: 'fadeInScale 0.5s ease-out forwards',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logoIcon: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      marginBottom: '16px',
      animation: 'pulse 2s infinite',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#737373',
    },
    form: {
      marginTop: '32px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #E5E5E5',
      borderRadius: '10px',
      background: '#FAFAFA',
      color: '#171717',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '24px',
      boxShadow: '0 4px 12px rgba(218, 165, 32, 0.3)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#DC2626',
      padding: '12px 16px',
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '20px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      animation: 'slideInTop 0.5s ease forwards',
    },
    demoBox: {
      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05), rgba(131, 68, 255, 0.05))',
      border: '1px solid rgba(218, 165, 32, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
    },
    demoTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#171717',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    demoButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    demoButton: {
      padding: '8px 12px',
      background: 'white',
      border: '1px solid rgba(218, 165, 32, 0.3)',
      borderRadius: '8px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleDemo: {
      textAlign: 'center',
      marginTop: '16px',
      fontSize: '12px',
      color: '#8344FF',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>👑</div>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Sign in to manage your organization</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {showDemoCredentials && !showMfa && (
          <div style={styles.demoBox}>
            <div style={styles.demoTitle}>
              <span>🔑</span>
              <span>Demo Credentials</span>
            </div>
            <div style={styles.demoButtons}>
              <button
                type="button"
                style={styles.demoButton}
                onClick={() => fillDemoCredentials('superadmin')}
                onMouseEnter={(e) => e.target.style.borderColor = '#DAA520'}
                onMouseLeave={(e) => e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)'}
              >
                <span><strong>Super Admin</strong> - Full access</span>
                <span style={{fontSize: '10px', color: '#737373'}}>Click to fill</span>
              </button>
              <button
                type="button"
                style={styles.demoButton}
                onClick={() => fillDemoCredentials('admin')}
                onMouseEnter={(e) => e.target.style.borderColor = '#8344FF'}
                onMouseLeave={(e) => e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)'}
              >
                <span><strong>Admin</strong> - System management</span>
                <span style={{fontSize: '10px', color: '#737373'}}>Click to fill</span>
              </button>
              <button
                type="button"
                style={styles.demoButton}
                onClick={() => fillDemoCredentials('manager')}
                onMouseEnter={(e) => e.target.style.borderColor = '#0066CC'}
                onMouseLeave={(e) => e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)'}
              >
                <span><strong>Manager</strong> - Operations only</span>
                <span style={{fontSize: '10px', color: '#737373'}}>Click to fill</span>
              </button>
            </div>
          </div>
        )}

        {!showMfa ? (
          <form style={styles.form} onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="admin@afripay.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div 
              style={styles.toggleDemo}
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            >
              {showDemoCredentials ? 'Hide' : 'Show'} demo credentials
            </div>
          </form>
        ) : (
          <form style={styles.form} onSubmit={handleMfaVerify}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>2FA Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                style={styles.input}
                placeholder="000000"
                maxLength="6"
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
