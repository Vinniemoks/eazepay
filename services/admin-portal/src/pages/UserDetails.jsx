import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`/api/admin/users/${userId}`)
      setUser(res.data.user)
    } catch (error) {
      console.error('Failed to fetch user details', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (approved) => {
    if (!approved && !rejectionReason) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    try {
      await axios.post(`/api/admin/users/${userId}/verify`, {
        approved,
        rejectionReason: approved ? null : rejectionReason
      })
      alert(`User ${approved ? 'verified' : 'rejected'} successfully`)
      navigate('/verifications')
    } catch (error) {
      alert('Verification failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!user) {
    return <div className="container"><p>User not found</p></div>
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/verifications')} style={{ marginBottom: '1rem', background: '#ccc', color: '#333' }}>
        ← Back to Verifications
      </button>

      <h1>User Verification</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* Personal Information */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Personal Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Full Name:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.fullName}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.email}</p>
            </div>
            <div>
              <strong>Phone:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.phone}</p>
            </div>
            <div>
              <strong>Role:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.role}</p>
            </div>
            <div>
              <strong>Registered:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Verification Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Verification Type:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.verificationType}</p>
            </div>
            <div>
              <strong>Verification Number:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>{user.verificationNumber}</p>
            </div>
            <div>
              <strong>Government Verified:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: user.governmentVerified ? '#28a745' : '#dc3545' }}>
                {user.governmentVerified ? 'Yes ✓' : 'No ✗'}
              </p>
            </div>
          </div>
        </div>

        {/* Business Details (for agents) */}
        {user.role === 'AGENT' && user.businessDetails && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Business Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong>Business Name:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>{user.businessDetails.businessName}</p>
              </div>
              <div>
                <strong>Registration Number:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>{user.businessDetails.registrationNumber}</p>
              </div>
              <div>
                <strong>Tax Number:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>{user.businessDetails.taxNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {user.verificationDocuments && user.verificationDocuments.length > 0 && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Uploaded Documents</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {user.verificationDocuments.map((doc, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{doc.type}</p>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Actions */}
      {user.status === 'PENDING' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Verification Decision</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Rejection Reason (if rejecting)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleVerify(true)}
              disabled={processing}
              style={{ flex: 1, background: '#28a745', color: 'white', padding: '1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              {processing ? 'Processing...' : 'Approve User'}
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={processing}
              style={{ flex: 1, background: '#dc3545', color: 'white', padding: '1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              {processing ? 'Processing...' : 'Reject User'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
