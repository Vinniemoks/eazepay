import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PendingVerifications() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingVerifications()
  }, [])

  const fetchPendingVerifications = async () => {
    try {
      const res = await axios.get('/api/admin/pending-verifications')
      setPendingUsers(res.data.pendingUsers)
    } catch (error) {
      console.error('Failed to fetch pending verifications', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (userId) => {
    navigate(`/users/${userId}`)
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="container">
      <h1>Pending Verifications</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Review and verify customer and agent registrations
      </p>

      {pendingUsers.length === 0 ? (
        <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>No pending verifications</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Verification Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Registered</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{user.fullName}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>{user.phone}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '12px', 
                      background: user.role === 'AGENT' ? '#fff3cd' : '#d1ecf1',
                      color: user.role === 'AGENT' ? '#856404' : '#0c5460',
                      fontSize: '0.875rem'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{user.verificationType}</td>
                  <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleReview(user.id)}
                      className="primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
