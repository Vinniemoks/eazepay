import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/agent/transactions')
      setTransactions(res.data)
    } catch (error) {
      console.error('Failed to fetch transactions', error)
    }
  }

  return (
    <div className="container">
      <h1>Agent Transactions</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Commission</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{tx.customerName}</td>
                <td style={{ padding: '1rem' }}>{tx.type}</td>
                <td style={{ padding: '1rem' }}>${tx.amount.toFixed(2)}</td>
                <td style={{ padding: '1rem', color: '#28a745' }}>${tx.commission.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
