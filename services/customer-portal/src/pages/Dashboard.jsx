import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [balance, setBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const walletRes = await axios.get('/api/wallet/balance')
      setBalance(walletRes.data.balance)
      const txRes = await axios.get('/api/transactions/recent')
      setRecentTransactions(txRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    }
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Wallet Balance</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>${balance.toFixed(2)}</p>
        </div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Recent Transactions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{recentTransactions.length}</p>
        </div>
      </div>
    </div>
  )
}
