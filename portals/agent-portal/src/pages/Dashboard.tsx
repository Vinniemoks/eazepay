import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Button,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import { 
  PersonAdd, 
  AccountBalance, 
  Fingerprint,
  TrendingUp,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { getAgentStats } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    registrations: 0,
    cashIns: 0,
    cashOuts: 0,
    totalVolume: 0
  });
  const [agentName, setAgentName] = useState('Agent');

  useEffect(() => {
    loadStats();
    loadAgentInfo();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getAgentStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAgentInfo = () => {
    const name = localStorage.getItem('agentName') || 'Agent';
    setAgentName(name);
  };

  // Large action buttons for main tasks
  const mainActions = [
    {
      title: 'Register New Customer',
      description: 'Enroll fingerprints & create account',
      icon: <PersonAdd sx={{ fontSize: 60 }} />,
      color: 'primary',
      path: '/register',
      gradient: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)'
    },
    {
      title: 'Verify Customer',
      description: 'Check customer identity',
      icon: <Fingerprint sx={{ fontSize: 60 }} />,
      color: 'secondary',
      path: '/verify',
      gradient: 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)'
    },
    {
      title: 'Cash Transactions',
      description: 'Cash-in or cash-out',
      icon: <AccountBalance sx={{ fontSize: 60 }} />,
      color: 'success',
      path: '/transactions',
      gradient: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)'
    }
  ];

  const statCards = [
    { 
      title: 'Customers Registered', 
      value: stats.registrations, 
      icon: <PersonAdd sx={{ fontSize: 40 }} />, 
      color: '#1E88E5',
      change: '+12%'
    },
    { 
      title: 'Cash-In Today', 
      value: stats.cashIns, 
      icon: <TrendingUp sx={{ fontSize: 40 }} />, 
      color: '#66BB6A',
      change: '+8%'
    },
    { 
      title: 'Cash-Out Today', 
      value: stats.cashOuts, 
      icon: <AccountBalance sx={{ fontSize: 40 }} />, 
      color: '#FFA726',
      change: '+5%'
    },
    { 
      title: 'Total Volume', 
      value: `KES ${stats.totalVolume.toLocaleString()}`, 
      icon: <AccountBalance sx={{ fontSize: 40 }} />, 
      color: '#26A69A',
      change: '+15%'
    }
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Welcome back, {agentName}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ready to help customers today
        </Typography>
      </Box>

      {/* System Status Alert */}
      <Alert 
        icon={<CheckCircle />} 
        severity="success" 
        sx={{ mb: 4, borderRadius: 3 }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          All systems operational
        </Typography>
        <Typography variant="body2">
          Biometric scanner connected • Network stable • Ready to serve
        </Typography>
      </Alert>

      {/* Main Action Buttons - Large and Simple */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: action.gradient,
                color: 'white',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  {action.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {action.description}
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.path);
                  }}
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistics Cards */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Today's Performance
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                  <Chip 
                    label={stat.change} 
                    size="small" 
                    color="success" 
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Tips */}
      <Card sx={{ mt: 4, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            💡 Quick Tips
          </Typography>
          <Typography variant="body2" paragraph>
            • Always verify customer identity before cash transactions
          </Typography>
          <Typography variant="body2" paragraph>
            • Ensure good lighting when capturing fingerprints
          </Typography>
          <Typography variant="body2">
            • Ask customers to clean their fingers for better capture quality
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
