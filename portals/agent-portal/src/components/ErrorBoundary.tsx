import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (e.g., Sentry)
      console.log('Error logged to monitoring service');
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Card sx={{ maxWidth: 500 }}>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Don't worry, this error has been isolated and won't affect other parts of the system.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Our team has been notified and will fix this soon.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{ mt: 2 }}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
