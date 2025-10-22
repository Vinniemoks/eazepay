// Luxury Royal Theme System
// Blend of Royal Gold, Purple, and Blue with adaptive color modes

export const themeColors = {
  // Primary Brand Colors - Royal Gold
  primary: {
    50: '#FFF8E7',   // Lightest gold
    100: '#FFE7B3',  // Very light gold
    200: '#FFD56F',  // Light gold
    300: '#FFC53D',  // Medium light gold
    400: '#FFB300',  // Base gold
    500: '#DAA520',  // Royal gold (Main brand color)
    600: '#B8860B',  // Dark gold
    700: '#956C00',  // Darker gold
    800: '#755400',  // Very dark gold
    900: '#553C00',  // Darkest gold
  },

  // Regal Purple Accent
  purple: {
    50: '#F6F0FF',
    100: '#E9DCFF',
    200: '#D3B7FF',
    300: '#B388FF',
    400: '#9B66FF',
    500: '#8344FF',  // Royal purple
    600: '#6B24EA',
    700: '#5A1FBE',
    800: '#481B94',
    900: '#35156D',
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
