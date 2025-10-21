import React, { useState } from 'react'
import axios from 'axios'

export default function Wallet() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const handleSendMoney = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/wallet/transfer', { recipient, amount: parseFloat(amount) })
      alert('Transfer successful!')
      setAmount('')
      setRecipient('')
    } catch (error) {
      alert('Transfer failed: ' + error.message)
    }
  }

  return (
    <div className="container">
      <h1>Wallet</h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem', maxWidth: '500px' }}>
        <h2>Send Money</h2>
        <form onSubmit={handleSendMoney} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Recipient Phone/Email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
          <button type="submit" className="primary">Send Money</button>
        </form>
      </div>
    </div>
  )
}
