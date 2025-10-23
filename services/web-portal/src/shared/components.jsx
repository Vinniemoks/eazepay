import React from 'react';
import { motion } from 'framer-motion';
import { Button as MuiButton, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AnimatedButton = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MuiButton {...props}>
        {children}
      </MuiButton>
    </motion.div>
  );
};

export const GradientText = styled(Typography)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)'
    : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

export const AnimatedCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

export const HeroSection = ({ title, subtitle, children }) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 4,
        py: 8,
      }}
    >
      <GradientText variant="h1" component="h1">
        {title}
      </GradientText>
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{ maxWidth: 'sm', mb: 4 }}
      >
        {subtitle}
      </Typography>
      {children}
    </Box>
  );
};