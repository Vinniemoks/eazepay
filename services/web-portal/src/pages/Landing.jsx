import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  IconButton,
  useMediaQuery,
  Stack,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion } from 'framer-motion';
import { HeroSection, AnimatedButton, AnimatedCard, GradientText } from '../shared/components';

const features = [
  {
    title: 'Seamless Payments',
    description: 'Process transactions quickly and securely across multiple channels',
    icon: '💳',
  },
  {
    title: 'Smart Analytics',
    description: 'Get real-time insights into your business performance',
    icon: '📊',
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security with end-to-end encryption',
    icon: '🔒',
  },
];

export default function LandingPage({ toggleTheme }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <IconButton onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <HeroSection
        title="Welcome to EazePay"
        subtitle="The future of digital payments - simple, secure, and seamless"
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 4 }}
        >
          <AnimatedButton
            variant="contained"
            color="primary"
            size="large"
            href="/login"
          >
            Get Started
          </AnimatedButton>
          <AnimatedButton
            variant="outlined"
            color="primary"
            size="large"
            href="/meme"
          >
            Meme Page
          </AnimatedButton>
          <AnimatedButton
            variant="outlined"
            color="primary"
            size="large"
            href="/register"
          >
            Create Account
          </AnimatedButton>
        </Stack>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <AnimatedCard
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box sx={{ fontSize: '3rem', mb: 2 }}>{feature.icon}</Box>
                    <GradientText variant="h5" gutterBottom>
                      {feature.title}
                    </GradientText>
                    <Box color="text.secondary">
                      {feature.description}
                    </Box>
                  </AnimatedCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        sx={{
          bgcolor: 'background.paper',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <GradientText variant="h3" gutterBottom>
            Ready to get started?
          </GradientText>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <AnimatedButton
              variant="contained"
              color="primary"
              size="large"
              href="/login"
            >
              Sign In
            </AnimatedButton>
            <AnimatedButton
              variant="outlined"
              color="primary"
              size="large"
              href="/register"
            >
              Register Now
            </AnimatedButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}