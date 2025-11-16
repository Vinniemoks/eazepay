import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Phone,
  Email,
  Help as HelpIcon,
  VideoLibrary,
  Description
} from '@mui/icons-material';

const Help: React.FC = () => {
  const faqs = [
    {
      question: 'How do I register a new customer?',
      answer: 'Click on "Register New Customer" from the dashboard. Enter customer details, then capture all 10 fingerprints and both palm prints. Review the information and click "Complete Registration".'
    },
    {
      question: 'What if fingerprint capture fails?',
      answer: 'Ensure good lighting, ask customer to clean their finger, and try again. If it still fails, you can upload a photo of the fingerprint as a backup.'
    },
    {
      question: 'How do I process a cash-in transaction?',
      answer: 'Go to "Cash Transactions", select "Cash In", verify customer with fingerprint, enter amount, and click "Process Cash In".'
    },
    {
      question: 'What should I do if the system is slow?',
      answer: 'Check your internet connection. The system is designed to work even with slow connections. If problems persist, contact support.'
    },
    {
      question: 'How do I verify a customer?',
      answer: 'Click "Verify Customer", capture their fingerprint, and the system will show their details if they are registered.'
    },
    {
      question: 'What if I make a mistake during registration?',
      answer: 'You can review all information before submitting. If you notice an error after submission, contact support immediately.'
    }
  ];

  const supportOptions = [
    {
      title: 'Call Support',
      description: '24/7 phone support',
      icon: <Phone sx={{ fontSize: 40 }} />,
      action: 'Call Now',
      contact: '+254 700 000 000',
      color: '#1E88E5'
    },
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: <Email sx={{ fontSize: 40 }} />,
      action: 'Send Email',
      contact: 'support@eazepay.com',
      color: '#26A69A'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch how-to videos',
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      action: 'Watch Videos',
      contact: 'Learn at your pace',
      color: '#66BB6A'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        <HelpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Help & Support
      </Typography>

      {/* Emergency Contact */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Need immediate help? Call: +254 700 000 000 (24/7)
        </Typography>
      </Alert>

      {/* Support Options */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {supportOptions.map((option) => (
          <Grid item xs={12} md={4} key={option.title}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Box sx={{ color: option.color, mb: 2 }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {option.description}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                  {option.contact}
                </Typography>
                <Button variant="contained" sx={{ bgcolor: option.color }}>
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQs */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Frequently Asked Questions
          </Typography>

          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Quick Guide */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
            Quick Start Guide
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 1:</strong> Log in with your phone number and password
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 2:</strong> From dashboard, choose what you want to do
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 3:</strong> Follow the on-screen instructions
          </Typography>
          <Typography variant="body2">
            <strong>Step 4:</strong> If you need help, click the help button or call support
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Help;
