import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Meme() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h1">Meme Page</Typography>
      <img src="https://i.imgflip.com/1bij.jpg" alt="meme" />
    </Box>
  );
}
