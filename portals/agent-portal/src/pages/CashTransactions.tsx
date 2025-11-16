import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Tabs, Tab } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import BiometricCapture from '../components/BiometricCapture';
import { processCashIn, processCashOut } from '../services/api';

const CashTransactions: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [biometricData, setBiometricData] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransaction = async () => {
    setLoading(true);
    try {
      const fn = tab === 0 ? processCashIn : processCashOut;
      await fn(biometricData, parseFloat(amount), 'KES');
      alert('Transaction successful!');
      setBiometricData('');
      setAmount('');
    } catch (error) {
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        <AccountBalance sx={{ verticalAlign: 'middle', mr: 1 }} />
        Cash Transactions
      </Typography>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label="Cash In" />
            <Tab label="Cash Out" />
          </Tabs>

          <BiometricCapture
            label="Verify Customer"
            captured={!!biometricData}
            onCapture={setBiometricData}
          />

          <TextField
            fullWidth
            label="Amount (KES)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleTransaction}
            disabled={!biometricData || !amount || loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Processing...' : `Process ${tab === 0 ? 'Cash In' : 'Cash Out'}`}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashTransactions;
