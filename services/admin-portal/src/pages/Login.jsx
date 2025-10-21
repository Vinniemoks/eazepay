import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function Login({ onLogin }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.requiresMfa) {
        setShowMfa(true);
      } else {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.background.default,
      padding: '20px',
    },
    card: {
      background: theme.background.paper,
      borderRadius: '24px',
      border: `1px solid ${theme.border}`,
      padding: '48px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: `0 20px 60px ${theme.shadow}`,
    },
    logo: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logoIcon: {
      width: '64px',
      height: '64px',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`,
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      marginBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: theme.text.secondary,
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
      border: `1px solid ${theme.border}`,
      borderRadius: '10px',
      background: theme.background.default,
      color: theme.text.primary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '24px',
    },
    error: {
      background: `${theme.error.light}15`,
      color: theme.error.main,
      padding: '12px 16px',
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '20px',
      border: `1px solid ${theme.error.light}`,
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
