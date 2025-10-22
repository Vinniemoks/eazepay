// Theme utility functions
export const generateGradient = (color1, color2, angle = 135) => 
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

// Animation utilities
export const animations = {
  fadeIn: (duration = 0.3, delay = 0) => ({
    animation: `fadeIn ${duration}s ease-out ${delay}s forwards`,
  }),
  
  spin: (duration = 1) => ({
    animation: `spin ${duration}s ease-in-out infinite`,
  }),
};

// Interactive state utilities
export const interactiveStates = {
  hover: (transform = true) => ({
    transform: transform ? 'translateY(-2px)' : 'none',
    boxShadow: 'var(--shadow-blend)',
  }),
  
  active: {
    transform: 'translateY(1px)',
  },
  
  focus: {
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
    outline: 'none',
  },
};

// Dark mode utilities
export const darkMode = {
  isDark: () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  
  adjustColors: (isDark = false) => ({
    royalGold: isDark ? '#FFD700' : '#DAA520',
    royalPurple: isDark ? '#9B66FF' : '#8344FF',
    royalBlue: isDark ? '#60A5FA' : '#3B82F6',
  }),
};

// Responsive utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const mediaQuery = (breakpoint) => 
  `@media (min-width: ${breakpoints[breakpoint]})`;

// Shadow utilities
export const shadows = {
  sm: '0 1px 3px rgba(218, 165, 32, 0.1)',
  md: '0 4px 6px rgba(218, 165, 32, 0.1)',
  lg: '0 10px 15px rgba(218, 165, 32, 0.1)',
  xl: '0 20px 25px rgba(218, 165, 32, 0.1)',
};

// Color manipulation utilities
export const adjustColor = (color, amount) => {
  // Implementation for lightening/darkening colors
  return color;  // Placeholder
};

export const getContrastColor = (backgroundColor) => {
  // Implementation for getting contrasting text color
  return '#FFFFFF';  // Placeholder
};

// Theme colors
export const colors = {
  royalGold: '#DAA520',
  royalGoldLight: '#FFD700',
  royalGoldDark: '#B8860B',
  royalPurple: '#8344FF',
  royalPurpleLight: '#9B66FF',
  royalPurpleDark: '#6B2FE0',
  royalBlue: '#0066CC',
  royalBlueLight: '#3B82F6',
  royalBlueDark: '#004E92',
};