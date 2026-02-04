export const theme = {
  colors: {
    // Backgrounds
    background: '#09090B', // Zinc 950
    surface: '#18181B', // Zinc 900
    surfaceHighlight: '#27272A', // Zinc 800
    
    // Primary Brand Colors
    primary: '#0ea5e9', // Sky 500
    primaryDark: '#0284c7', // Sky 600
    primaryLight: '#38bdf8', // Sky 400
    
    // Semantic Colors
    success: '#10b981', // Emerald 500
    successBackground: 'rgba(16, 185, 129, 0.1)',
    error: '#ef4444', // Red 500
    errorBackground: 'rgba(239, 68, 68, 0.1)',
    warning: '#f59e0b', // Amber 500
    info: '#3b82f6', // Blue 500
    
    // Text Colors
    textPrimary: '#FAFAFA', // Zinc 50
    textSecondary: '#A1A1AA', // Zinc 400
    textTertiary: '#71717A', // Zinc 500
    textInverse: '#FFFFFF',

    // Borders
    border: '#27272A', // Zinc 800
    borderFocus: '#0ea5e9', // Sky 500
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      regular: '400' as '400',
      medium: '500' as '500',
      bold: '700' as '700',
    } as const,
    activeOpacity: 0.7,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
