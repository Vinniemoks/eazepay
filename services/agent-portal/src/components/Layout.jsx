import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#28a745', color: 'white', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Eazepay Agent</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/transactions" style={{ color: 'white', textDecoration: 'none' }}>Transactions</Link>
            <Link to="/customers" style={{ color: 'white', textDecoration: 'none' }}>Customers</Link>
            <span>Agent: {user?.agentId}</span>
            <button onClick={logout} style={{ background: 'white', color: '#28a745' }}>Logout</button>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem', background: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  )
}
