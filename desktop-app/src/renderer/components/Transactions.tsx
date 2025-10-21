import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const token = await window.electron.store.get('access_token');
      const response = await axios.get('http://localhost:8000/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transactions">
      <h2>Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                <td>{tx.type}</td>
                <td>{tx.description}</td>
                <td className={tx.type === 'RECEIVE' ? 'positive' : 'negative'}>
                  {tx.type === 'RECEIVE' ? '+' : '-'}KES {tx.amount.toFixed(2)}
                </td>
                <td>
                  <span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
