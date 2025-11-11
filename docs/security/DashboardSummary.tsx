import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, CircularProgress } from '@mui/material';

interface DashboardData {
  totalTransactionVolume: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
}

const DashboardSummary: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assume an API client is configured to handle auth headers
        const response = await fetch('/api/analytics/dashboard-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Total Volume</Typography>
          <Typography variant="h4">{data?.totalTransactionVolume.toLocaleString()}</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Total Transactions</Typography>
          <Typography variant="h4">{data?.totalTransactions.toLocaleString()}</Typography>
        </Card>
      </Grid>
      {/* Add more cards for other metrics like successRate, etc. */}
    </Grid>
  );
};

export default DashboardSummary;