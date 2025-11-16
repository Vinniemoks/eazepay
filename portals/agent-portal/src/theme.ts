import { createTheme } from '@mui/material/styles';

// Eazepay Brand Colors
export const colors = {
  primary: {
    main: '#1E88E5',      // Bright Blue
    light: '#64B5F6',
    dark: '#1565C0',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#26A69A',      // Teal
    light: '#80CBC4',
    dark: '#00897B',
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#66BB6A',      // Green
    light: '#81C784',
    dark: '#388E3C'
  },
  warning: {
    main: '#FFA726',      // Orange
    light: '#FFB74D',
    dark: '#F57C00'
  },
  error: {
    main: '#EF5350',      // Red
    light: '#E57373',
    dark: '#C62828'
  },
  info: {
    main: '#42A5F5',      // Light Blue
    light: '#64B5F6',
    dark: '#1976D2'
  },
  background: {
    default: '#F5F7FA',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#263238',
    secondary: '#546E7A'
  }
};

export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: colors.background,
    text: colors.text
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;
