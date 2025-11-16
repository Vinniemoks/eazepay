import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Phone,
  LocationOn,
  Badge,
  Star,
  CheckCircle,
  Edit
} from '@mui/icons-material';

const AgentProfile: React.FC = () => {
  const [agent] = useState({
    name: 'John Doe',
    phone: '254712345678',
    agentId: 'AGT-001',
    location: 'Nairobi, Kenya',
    status: 'Active',
    rating: 4.8,
    joinedDate: '2024-01-15',
    totalCustomers: 156,
    totalTransactions: 1234
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {agent.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {agent.name}
              </Typography>
              <Chip
                icon={<CheckCircle />}
                label={agent.status}
                color="success"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                <Star sx={{ color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {agent.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                fullWidth
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Agent Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Badge color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Agent ID"
                    secondary={agent.agentId}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={agent.phone}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={agent.location}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Joined Date"
                    secondary={new Date(agent.joinedDate).toLocaleDateString()}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Performance Summary
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {agent.totalCustomers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Customers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {agent.totalTransactions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentProfile;
