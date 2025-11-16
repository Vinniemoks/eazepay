import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import { Fingerprint } from '@mui/icons-material';
import BiometricCapture from '../components/BiometricCapture';
import { verifyCustomer } from '../services/api';

const VerifyCustomer: React.FC = () => {
  const [biometricData, setBiometricData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await verifyCustomer(biometricData);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        <Fingerprint sx={{ verticalAlign: 'middle', mr: 1 }} />
        Verify Customer
      </Typography>

      <Card>
        <CardContent>
          <BiometricCapture
            label="Capture Fingerprint"
            captured={!!biometricData}
            onCapture={setBiometricData}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={!biometricData || loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify Customer'}
          </Button>

          {result && (
            <Alert severity={result.verified ? 'success' : 'error'} sx={{ mt: 2 }}>
              {result.verified ? (
                <>
                  <Typography><strong>Customer Verified!</strong></Typography>
                  <Typography>Name: {result.customer?.fullName}</Typography>
                  <Typography>Phone: {result.customer?.phoneNumber}</Typography>
                </>
              ) : (
                'Customer not found or verification failed'
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyCustomer;
