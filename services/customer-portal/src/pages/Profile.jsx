import React from 'react'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const user = useAuthStore(state => state.user)

  return (
    <div className="container">
      <h1>Profile</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem', maxWidth: '500px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Name:</strong> {user?.name}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Email:</strong> {user?.email}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Phone:</strong> {user?.phone}
        </div>
        <button className="primary" style={{ marginTop: '1rem' }}>Edit Profile</button>
      </div>
    </div>
  )
}
