import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface WalletData {
  balance: number;
  recentTransactions: any[];
}

export const Dashboard: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, recentTransactions: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const token = await window.electron.store.get('access_token');
      const response = await axios.get('http://localhost:8000/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="balance-card">
        <h3>Available Balance</h3>
        <p className="balance-amount">KES {wallet.balance.toFixed(2)}</p>
      </div>

      <div className="quick-actions">
        <button className="action-btn">Send Money</button>
        <button className="action-btn">Request Money</button>
        <button className="action-btn">Add Money</button>
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {wallet.recentTransactions.length === 0 ? (
          <p>No recent transactions</p>
        ) : (
          <ul>
            {wallet.recentTransactions.map((tx: any) => (
              <li key={tx.id}>
                <span>{tx.description}</span>
                <span>KES {tx.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
