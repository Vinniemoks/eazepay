// Royal Yellow & Gold Theme System
// Adaptive color system with light/dark modes and brightness adjustment

export const themeColors = {
  // Primary Brand Colors - Royal Yellow & Gold
  primary: {
    50: '#FFFBEB',   // Lightest gold
    100: '#FEF3C7',  // Very light gold
    200: '#FDE68A',  // Light gold
    300: '#FCD34D',  // Medium light gold
    400: '#FBBF24',  // Base yellow
    500: '#F59E0B',  // Primary gold
    600: '#D97706',  // Dark gold
    700: '#B45309',  // Darker gold
    800: '#92400E',  // Very dark gold
    900: '#78350F',  // Darkest gold
  },
  
  // Royal Gold Accent
  royal: {
    50: '#FFF9E6',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',  // Royal gold
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Neutral Grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: {
    light: '#10B981',
    main: '#059669',
    dark: '#047857',
  },
  error: {
    light: '#EF4444',
    main: '#DC2626',
    dark: '#B91C1C',
  },
  warning: {
    light: '#F59E0B',
    main: '#D97706',
    dark: '#B45309',
  },
  info: {
    light: '#3B82F6',
    main: '#2563EB',
    dark: '#1D4ED8',
  },
};

// Light Theme
export const lightTheme = {
  mode: 'light',
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#171717',
    secondary: '#525252',
    disabled: '#A3A3A3',
    hint: '#737373',
  },
  primary: themeColors.primary[500],
  primaryLight: themeColors.primary[400],
  primaryDark: themeColors.primary[600],
  royal: themeColors.royal[500],
  border: '#E5E5E5',
  divider: '#E5E5E5',
  shadow: 'rgba(0, 0, 0, 0.1)',
  ...themeColors,
};

// Dark Theme
export const darkTheme = {
  mode: 'dark',
  background: {
    default: '#0A0A0A',
    paper: '#171717',
    elevated: '#262626',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#D4D4D4',
    disabled: '#737373',
    hint: '#A3A3A3',
  },
  primary: themeColors.primary[400],
  primaryLight: themeColors.primary[300],
  primaryDark: themeColors.primary[500],
  royal: themeColors.royal[400],
  border: '#404040',
  divider: '#404040',
  shadow: 'rgba(0, 0, 0, 0.5)',
  ...themeColors,
};

// Brightness adjustment function
export const adjustBrightness = (color, amount) => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get adaptive theme based on system preference
export const getAdaptiveTheme = (mode, brightness = 0) => {
  const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
  
  if (brightness === 0) return baseTheme;
  
  // Adjust colors based on brightness
  return {
    ...baseTheme,
    background: {
      ...baseTheme.background,
      default: adjustBrightness(baseTheme.background.default, brightness),
      paper: adjustBrightness(baseTheme.background.paper, brightness),
      elevated: adjustBrightness(baseTheme.background.elevated, brightness),
    },
  };
};
