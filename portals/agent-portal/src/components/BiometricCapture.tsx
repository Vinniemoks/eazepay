import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Fingerprint,
  CheckCircle,
  CameraAlt,
  Refresh,
  Star
} from '@mui/icons-material';

interface BiometricCaptureProps {
  label: string;
  captured: boolean;
  onCapture: (data: string) => void;
  isPrimary?: boolean;
  onSetPrimary?: () => void;
  isPalm?: boolean;
}

const BiometricCapture: React.FC<BiometricCaptureProps> = ({
  label,
  captured,
  onCapture,
  isPrimary,
  onSetPrimary,
  isPalm
}) => {
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    setCapturing(true);

    // Simulate biometric capture
    // In production, this would interface with actual biometric hardware
    setTimeout(() => {
      // Generate mock biometric data (base64)
      const mockData = btoa(`biometric_${label}_${Date.now()}`);
      onCapture(mockData);
      setCapturing(false);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Remove data URL prefix
        const data = base64.split(',')[1];
        onCapture(data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      sx={{ 
        position: 'relative',
        border: captured ? '2px solid' : '1px solid',
        borderColor: captured ? 'success.main' : 'divider',
        bgcolor: isPrimary ? 'primary.50' : 'background.paper'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          {isPrimary && (
            <Chip
              icon={<Star />}
              label="Primary"
              size="small"
              color="primary"
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
            bgcolor: captured ? 'success.50' : 'grey.100',
            borderRadius: 1,
            position: 'relative'
          }}
        >
          {captured ? (
            <>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="success.main">
                Captured
              </Typography>
            </>
          ) : capturing ? (
            <>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Capturing...
              </Typography>
            </>
          ) : (
            <>
              <Fingerprint sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isPalm ? 'Place palm' : 'Place finger'}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {!captured ? (
            <>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={handleCapture}
                disabled={capturing}
                startIcon={<CameraAlt />}
              >
                Capture
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <CameraAlt />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleRecapture}
                startIcon={<Refresh />}
              >
                Recapture
              </Button>
              {onSetPrimary && !isPrimary && (
                <Button
                  size="small"
                  onClick={onSetPrimary}
                  startIcon={<Star />}
                >
                  Set Primary
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BiometricCapture;
