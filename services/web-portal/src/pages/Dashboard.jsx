import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { GradientText, AnimatedCard } from '../shared/components';

export default function Dashboard() {
  return (
    <Box sx={{ p: 4 }}>
      <GradientText variant="h2" component="h1" gutterBottom>
        Welcome to EazePay Dashboard
      </GradientText>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Your payment analytics and management portal
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <Typography variant="h6" gutterBottom>
              Total Transactions
            </Typography>
            <Typography variant="h3" color="primary">
              1,234
            </Typography>
          </AnimatedCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <Typography variant="h6" gutterBottom>
              Revenue
            </Typography>
            <Typography variant="h3" color="primary">
              $45,678
            </Typography>
          </AnimatedCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <Typography variant="h6" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h3" color="primary">
              890
            </Typography>
          </AnimatedCard>
        </Grid>
      </Grid>
    </Box>
  );
}