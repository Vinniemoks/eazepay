import React, { useState } from 'react';
import axios from 'axios';

export const SendMoney: React.FC = () => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const token = await window.electron.store.get('access_token');
      await axios.post(
        'http://localhost:8000/api/wallet/send',
        {
          recipientPhone,
          amount: parseFloat(amount),
          description,
          pin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      setRecipientPhone('');
      setAmount('');
      setDescription('');
      setPin('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send money');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="send-money">
      <h2>Send Money</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Phone Number</label>
          <input
            type="tel"
            value={recipientPhone}
            onChange={e => setRecipientPhone(e.target.value)}
            placeholder="+254712345678"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="1"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's this for?"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>PIN</label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter your PIN"
            maxLength={4}
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Money sent successfully!</div>}

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? 'Sending...' : 'Send Money'}
        </button>
      </form>
    </div>
  );
};
