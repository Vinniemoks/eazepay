import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../../../shared/styles/animations.css'

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationType: 'NATIONAL_ID',
    verificationNumber: '',
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'CUSTOMER',
        verificationType: formData.verificationType,
        verificationNumber: formData.verificationNumber
      })

      alert('Registration successful! Your account is pending verification.')
      navigate('/login')
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || error.message))
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
      padding: '2rem',
      animation: 'fadeIn 0.8s ease-out forwards',
    },
    card: {
      background: 'white',
      borderRadius: '24px',
      border: '1px solid rgba(218, 165, 32, 0.1)',
      padding: '48px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(218, 165, 32, 0.15)',
      animation: 'fadeInScale 0.5s ease-out forwards',
    },
    header: {
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
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    inputGroup: {
      marginBottom: '4px',
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
    select: {
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
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '8px',
    },
    checkboxInput: {
      width: 'auto',
      margin: 0,
    },
    checkboxLabel: {
      margin: 0,
      fontSize: '14px',
      color: '#525252',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '8px',
    },
    button: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    backButton: {
      flex: 1,
      padding: '14px',
      background: '#E5E5E5',
      color: '#171717',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#737373',
    },
    link: {
      color: '#DAA520',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s ease',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '24px',
    },
    stepDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#E5E5E5',
      transition: 'all 0.3s ease',
    },
    stepDotActive: {
      width: '24px',
      borderRadius: '4px',
      background: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>🚀</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Eazepay for secure digital payments</p>
        </div>

        <div style={styles.stepIndicator}>
          <div style={{...styles.stepDot, ...(step === 1 ? styles.stepDotActive : {})}}></div>
          <div style={{...styles.stepDot, ...(step === 2 ? styles.stepDotActive : {})}}></div>
        </div>
        
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+254712345678"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <button type="submit" style={styles.button}>Next</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
                minLength={8}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Verification Type</label>
              <select
                name="verificationType"
                value={formData.verificationType}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="HUDUMA">Huduma Number</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Verification Number</label>
              <input
                type="text"
                name="verificationNumber"
                placeholder="Enter your ID/Passport/Huduma number"
                value={formData.verificationNumber}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.checkbox}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={styles.checkboxInput}
                required
              />
              <label style={styles.checkboxLabel}>I accept the terms and conditions</label>
            </div>
            
            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => setStep(1)} style={styles.backButton}>Back</button>
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}
        
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  )
}
