// Luxury Royal Theme Configuration
export const themeConfig = {
  colors: {
    royalGold: '#DAA520',
    royalPurple: '#8344FF',
    royalBlue: '#3B82F6',
    
    // Extended palette
    gold: {
      50: '#FFF8E7',
      100: '#FFE7B3',
      200: '#FFD56F',
      300: '#FFC53D',
      400: '#FFB300',
      500: '#DAA520',
      600: '#B8860B',
      700: '#956C00',
      800: '#755400',
      900: '#553C00',
    },
    purple: {
      50: '#F6F0FF',
      100: '#E9DCFF',
      200: '#D3B7FF',
      300: '#B388FF',
      400: '#9B66FF',
      500: '#8344FF',
      600: '#6B24EA',
      700: '#5A1FBE',
      800: '#481B94',
      900: '#35156D',
    },
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
  },
  
  gradients: {
    royalBlend: 'linear-gradient(135deg, #DAA520 0%, #8344FF 50%, #3B82F6 100%)',
    goldPurple: 'linear-gradient(135deg, #DAA520 0%, #8344FF 100%)',
    purpleBlue: 'linear-gradient(135deg, #8344FF 0%, #3B82F6 100%)',
    goldBlue: 'linear-gradient(135deg, #DAA520 0%, #3B82F6 100%)',
  },
  
  shadows: {
    royal: '0 4px 20px rgba(218, 165, 32, 0.15)',
    purple: '0 4px 20px rgba(131, 68, 255, 0.15)',
    blue: '0 4px 20px rgba(59, 130, 246, 0.15)',
    blend: '0 4px 25px rgba(131, 68, 255, 0.2)',
  },
  
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  animation: {
    fadeIn: {
      keyframes: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
      defaultTiming: '0.3s ease-out forwards',
    },
    spin: {
      keyframes: `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `,
      defaultTiming: '1s ease-in-out infinite',
    },
  },
  
  // Dark mode adjustments
  darkMode: {
    colors: {
      royalGold: '#FFD700',
      royalPurple: '#9B66FF',
      royalBlue: '#60A5FA',
    },
    backgrounds: {
      card: 'rgba(255, 255, 255, 0.05)',
      input: 'rgba(255, 255, 255, 0.05)',
      hover: 'rgba(218, 165, 32, 0.1)',
    },
    borders: {
      default: 'rgba(218, 165, 32, 0.2)',
      input: 'rgba(218, 165, 32, 0.3)',
    },
  },
};