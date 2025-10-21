import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalTransactions: 0, totalCommission: 0, activeCustomers: 0 })
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/agent/dashboard')
      setStats(res.data.stats)
      setChartData(res.data.chartData)
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    }
  }

  return (
    <div className="container">
      <h1>Agent Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Transactions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>{stats.totalTransactions}</p>
        </div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Commission Earned</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>${stats.totalCommission.toFixed(2)}</p>
        </div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Active Customers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activeCustomers}</p>
        </div>
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>Transaction Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="transactions" stroke="#007bff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
