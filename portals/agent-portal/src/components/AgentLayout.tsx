import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Dashboard,
  PersonAdd,
  Fingerprint,
  AccountBalance,
  Logout,
  HelpOutline
} from '@mui/icons-material';

const drawerWidth = 260;

const AgentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentName, setAgentName] = useState('Agent');

  useEffect(() => {
    const name = localStorage.getItem('agentName') || 'Agent';
    setAgentName(name);
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', color: '#1E88E5' },
    { text: 'Register Customer', icon: <PersonAdd />, path: '/register', color: '#26A69A' },
    { text: 'Verify Customer', icon: <Fingerprint />, path: '/verify', color: '#66BB6A' },
    { text: 'Transactions', icon: <AccountBalance />, path: '/transactions', color: '#FFA726' }
  ];

  const bottomMenuItems = [
    { text: 'My Profile', icon: <Avatar sx={{ width: 24, height: 24 }}>{agentName.charAt(0)}</Avatar>, path: '/profile' },
    { text: 'Help', icon: <HelpOutline />, path: '/help' }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('agentName');
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Fingerprint sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Eazepay Agent
          </Typography>
          <Chip 
            label="Online" 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 600,
              mr: 2
            }} 
          />
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.1)' 
              } 
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRight: 'none',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
          <List sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? `${item.color}15` : 'transparent',
                    color: isActive(item.path) ? item.color : 'text.primary',
                    '&:hover': {
                      bgcolor: `${item.color}10`
                    },
                    py: 1.5
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive(item.path) ? 600 : 400 
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            {bottomMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? 'primary.50' : 'transparent',
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AgentLayout;
