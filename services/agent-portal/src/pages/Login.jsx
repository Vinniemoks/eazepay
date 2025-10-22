import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import '../../../shared/styles/animations.css'

export default function Login() {
  const [agentId, setAgentId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [buttonHover, setButtonHover] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await axios.post('/api/agent/login', { agentId, password })
      login(res.data.agent, res.data.token)
      navigate('/')
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05) 0%, rgba(131, 68, 255, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)',
      padding: '20px',
      animation: 'fadeIn 0.8s ease-out forwards',
    },
    card: {
      background: 'white',
      borderRadius: '24px',
      border: '1px solid rgba(218, 165, 32, 0.1)',
      padding: '48px',
      width: '100%',
      maxWidth: '440px',
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
      color: '#171717',
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
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(218, 165, 32, 0.3)',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(218, 165, 32, 0.4), 0 4px 12px rgba(131, 68, 255, 0.3)',
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
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🎯</div>
          <h1 style={styles.title}>Agent Portal</h1>
          <p style={styles.subtitle}>Sign in to manage transactions</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Agent ID</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              style={styles.input}
              placeholder="Enter your agent ID"
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

          <button 
            type="submit" 
            style={{...styles.button, ...(buttonHover ? styles.buttonHover : {})}} 
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
