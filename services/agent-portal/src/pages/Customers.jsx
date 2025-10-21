import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/agent/customers')
      setCustomers(res.data)
    } catch (error) {
      console.error('Failed to fetch customers', error)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Customers</h1>
        <button className="primary" onClick={() => setShowModal(true)}>Register New Customer</button>
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Registered</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{customer.name}</td>
                <td style={{ padding: '1rem' }}>{customer.phone}</td>
                <td style={{ padding: '1rem' }}>{new Date(customer.registeredAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{customer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
