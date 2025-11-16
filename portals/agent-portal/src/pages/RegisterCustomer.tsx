import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import { 
  Person, 
  CheckCircle,
  Warning
} from '@mui/icons-material';
import BiometricCapture from '../components/BiometricCapture';
import { registerCustomer } from '../services/api';

interface BiometricData {
  type: 'fingerprint' | 'palm';
  fingerType?: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  hand: 'left' | 'right';
  data: string;
  captured: boolean;
}

const steps = ['Customer Details', 'Capture Biometrics', 'Review & Submit'];

const RegisterCustomer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Customer details
  const [customerData, setCustomerData] = useState({
    phoneNumber: '',
    fullName: '',
    nationalId: '',
    email: ''
  });

  // Biometric data for all 10 fingers + 2 palms
  const [biometrics, setBiometrics] = useState<BiometricData[]>([
    // Left hand
    { type: 'fingerprint', fingerType: 'thumb', hand: 'left', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'index', hand: 'left', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'middle', hand: 'left', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'ring', hand: 'left', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'pinky', hand: 'left', data: '', captured: false },
    
    // Right hand
    { type: 'fingerprint', fingerType: 'thumb', hand: 'right', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'index', hand: 'right', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'middle', hand: 'right', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'ring', hand: 'right', data: '', captured: false },
    { type: 'fingerprint', fingerType: 'pinky', hand: 'right', data: '', captured: false },
    
    // Palms
    { type: 'palm', hand: 'left', data: '', captured: false },
    { type: 'palm', hand: 'right', data: '', captured: false }
  ]);

  const [primaryFingerIndex, setPrimaryFingerIndex] = useState(6); // Right index finger

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleBiometricCapture = (index: number, data: string) => {
    setBiometrics(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], data, captured: true };
      return updated;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate all biometrics are captured
      const allCaptured = biometrics.every(b => b.captured);
      if (!allCaptured) {
        throw new Error('Please capture all biometric data');
      }

      // Submit registration
      const result = await registerCustomer({
        ...customerData,
        biometricData: biometrics.map(b => ({
          type: b.type,
          fingerType: b.fingerType,
          hand: b.hand,
          data: b.data
        })),
        primaryFingerIndex
      });

      setRegistrationResult(result);
      setSuccess(true);
      setActiveStep(3); // Move to success step
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="254712345678"
                  value={customerData.phoneNumber}
                  onChange={(e) => handleCustomerDataChange('phoneNumber', e.target.value)}
                  helperText="Format: 254XXXXXXXXX"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={customerData.fullName}
                  onChange={(e) => handleCustomerDataChange('fullName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="National ID"
                  value={customerData.nationalId}
                  onChange={(e) => handleCustomerDataChange('nationalId', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Capture Biometric Data
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Capture all 10 fingerprints and both palm prints. The customer will use their primary finger for quick payments.
            </Alert>

            {/* Left Hand */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Left Hand</strong>
              </Typography>
              <Grid container spacing={2}>
                {biometrics.slice(0, 5).map((bio, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <BiometricCapture
                      label={`${bio.fingerType?.toUpperCase()} - ${bio.hand.toUpperCase()}`}
                      captured={bio.captured}
                      onCapture={(data) => handleBiometricCapture(index, data)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Right Hand */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Right Hand</strong>
              </Typography>
              <Grid container spacing={2}>
                {biometrics.slice(5, 10).map((bio, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index + 5}>
                    <BiometricCapture
                      label={`${bio.fingerType?.toUpperCase()} - ${bio.hand.toUpperCase()}`}
                      captured={bio.captured}
                      onCapture={(data) => handleBiometricCapture(index + 5, data)}
                      isPrimary={index + 5 === primaryFingerIndex}
                      onSetPrimary={() => setPrimaryFingerIndex(index + 5)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Palms */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Palm Prints</strong>
              </Typography>
              <Grid container spacing={2}>
                {biometrics.slice(10, 12).map((bio, index) => (
                  <Grid item xs={12} sm={6} key={index + 10}>
                    <BiometricCapture
                      label={`${bio.hand.toUpperCase()} PALM`}
                      captured={bio.captured}
                      onCapture={(data) => handleBiometricCapture(index + 10, data)}
                      isPalm
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Progress */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Captured: {biometrics.filter(b => b.captured).length} / {biometrics.length}
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Registration
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer Details
                </Typography>
                <Typography><strong>Name:</strong> {customerData.fullName}</Typography>
                <Typography><strong>Phone:</strong> {customerData.phoneNumber}</Typography>
                <Typography><strong>National ID:</strong> {customerData.nationalId}</Typography>
                {customerData.email && (
                  <Typography><strong>Email:</strong> {customerData.email}</Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Biometric Data
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {biometrics.map((bio, index) => (
                    <Chip
                      key={index}
                      icon={bio.captured ? <CheckCircle /> : <Warning />}
                      label={
                        bio.type === 'palm' 
                          ? `${bio.hand} palm` 
                          : `${bio.hand} ${bio.fingerType}`
                      }
                      color={bio.captured ? 'success' : 'default'}
                      variant={index === primaryFingerIndex ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Primary finger: {biometrics[primaryFingerIndex].hand} {biometrics[primaryFingerIndex].fingerType}
                </Typography>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (success && registrationResult) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {customerData.fullName} has been successfully registered.
            </Typography>

            <Box sx={{ mt: 4, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Registration Details:
              </Typography>
              <Typography><strong>User ID:</strong> {registrationResult.userId}</Typography>
              <Typography><strong>Wallet ID:</strong> {registrationResult.walletId}</Typography>
              <Typography><strong>Templates Enrolled:</strong> {registrationResult.templatesEnrolled}</Typography>
            </Box>

            <Alert severity="success" sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Next Steps:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Customer can now use biometric payment</li>
                <li>Customer should top up wallet via M-Pesa</li>
                <li>Customer can request virtual card for online shopping</li>
              </ul>
            </Alert>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  setSuccess(false);
                  setActiveStep(0);
                  setCustomerData({ phoneNumber: '', fullName: '', nationalId: '', email: '' });
                  setBiometrics(prev => prev.map(b => ({ ...b, data: '', captured: false })));
                }}
              >
                Register Another Customer
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/agent/dashboard'}
              >
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
        Register New Customer
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && (!customerData.phoneNumber || !customerData.fullName || !customerData.nationalId)) ||
                    (activeStep === 1 && !biometrics.every(b => b.captured))
                  }
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterCustomer;
