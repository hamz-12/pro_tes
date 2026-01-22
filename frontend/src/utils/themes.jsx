import { COLORS, CSS_VARIABLES } from './constants';

/**
 * Dark theme configuration
 */
export const darkTheme = {
  name: 'dark',
  colors: {
    // Primary colors
    primary: COLORS.PRIMARY,
    primaryLight: COLORS.PRIMARY_LIGHT,
    primaryDark: COLORS.PRIMARY_DARK,
    
    // Secondary colors
    secondary: COLORS.SECONDARY,
    secondaryLight: COLORS.SECONDARY_LIGHT,
    secondaryDark: COLORS.SECONDARY_DARK,
    
    // Tertiary colors
    tertiary: COLORS.TERTIARY,
    tertiaryLight: COLORS.TERTIARY_LIGHT,
    tertiaryDark: COLORS.TERTIARY_DARK,
    
    // Status colors
    success: COLORS.SUCCESS,
    warning: COLORS.WARNING,
    error: COLORS.ERROR,
    info: COLORS.INFO,
    
    // Background colors
    background: {
      primary: COLORS.GRAY_950,
      secondary: COLORS.GRAY_900,
      tertiary: COLORS.GRAY_800,
      card: 'rgba(255, 255, 255, 0.05)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      modal: 'rgba(15, 23, 42, 0.95)',
    },
    
    // Text colors
    text: {
      primary: COLORS.GRAY_100,
      secondary: COLORS.GRAY_400,
      tertiary: COLORS.GRAY_600,
      inverted: COLORS.GRAY_950,
      link: COLORS.PRIMARY_LIGHT,
      placeholder: COLORS.GRAY_500,
    },
    
    // Border colors
    border: {
      primary: COLORS.GRAY_800,
      secondary: COLORS.GRAY_700,
      accent: COLORS.PRIMARY,
      error: COLORS.ERROR,
      success: COLORS.SUCCESS,
    },
    
    // Button colors
    button: {
      primary: {
        background: COLORS.PRIMARY,
        text: COLORS.WHITE,
        hover: COLORS.PRIMARY_DARK,
        active: COLORS.PRIMARY_DARK,
        disabled: COLORS.GRAY_700,
      },
      secondary: {
        background: 'transparent',
        text: COLORS.PRIMARY,
        border: COLORS.PRIMARY,
        hover: 'rgba(139, 92, 246, 0.1)',
        active: 'rgba(139, 92, 246, 0.2)',
      },
      danger: {
        background: COLORS.ERROR,
        text: COLORS.WHITE,
        hover: '#dc2626',
        active: '#b91c1c',
      },
    },
    
    // Input colors
    input: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: COLORS.GRAY_800,
      text: COLORS.GRAY_100,
      placeholder: COLORS.GRAY_500,
      focus: {
        border: COLORS.PRIMARY,
        shadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
      },
      error: {
        border: COLORS.ERROR,
        background: 'rgba(239, 68, 68, 0.05)',
      },
      success: {
        border: COLORS.SUCCESS,
        background: 'rgba(34, 197, 94, 0.05)',
      },
    },
    
    // Card colors
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      hover: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(139, 92, 246, 0.3)',
        shadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
      },
    },
    
    // Table colors
    table: {
      background: 'rgba(255, 255, 255, 0.02)',
      header: {
        background: 'rgba(255, 255, 255, 0.05)',
        text: COLORS.GRAY_300,
        border: COLORS.GRAY_800,
      },
      row: {
        background: 'transparent',
        hover: 'rgba(255, 255, 255, 0.02)',
        border: COLORS.GRAY_800,
      },
    },
    
    // Navigation colors
    navigation: {
      background: COLORS.GRAY_900,
      item: {
        background: 'transparent',
        text: COLORS.GRAY_400,
        hover: 'rgba(255, 255, 255, 0.1)',
        active: {
          background: 'rgba(139, 92, 246, 0.2)',
          text: COLORS.PRIMARY,
          border: COLORS.PRIMARY,
        },
      },
    },
    
    // Alert colors
    alert: {
      success: {
        background: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.3)',
        text: COLORS.SUCCESS,
        icon: COLORS.SUCCESS,
      },
      warning: {
        background: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: COLORS.WARNING,
        icon: COLORS.WARNING,
      },
      error: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        text: COLORS.ERROR,
        icon: COLORS.ERROR,
      },
      info: {
        background: 'rgba(96, 165, 250, 0.1)',
        border: 'rgba(96, 165, 250, 0.3)',
        text: COLORS.INFO,
        icon: COLORS.INFO,
      },
    },
    
    // Chart colors
    chart: {
      colors: [
        COLORS.PRIMARY,
        COLORS.SECONDARY,
        COLORS.TERTIARY,
        COLORS.INFO,
        COLORS.WARNING,
        COLORS.ERROR,
        '#8b5cf6', // Purple
        '#60a5fa', // Blue
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#8b5cf6', // Indigo
      ],
      grid: COLORS.GRAY_800,
      axis: COLORS.GRAY_600,
      tooltip: {
        background: 'rgba(15, 23, 42, 0.95)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: COLORS.GRAY_100,
      },
    },
    
    // Gradient definitions
    gradients: {
      primary: `linear-gradient(135deg, ${COLORS.PRIMARY}, ${COLORS.PRIMARY_DARK})`,
      secondary: `linear-gradient(135deg, ${COLORS.SECONDARY}, ${COLORS.SECONDARY_DARK})`,
      tertiary: `linear-gradient(135deg, ${COLORS.TERTIARY}, ${COLORS.TERTIARY_DARK})`,
      success: `linear-gradient(135deg, ${COLORS.SUCCESS}, #059669)`,
      warning: `linear-gradient(135deg, ${COLORS.WARNING}, #d97706)`,
      error: `linear-gradient(135deg, ${COLORS.ERROR}, #dc2626)`,
      glass: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))`,
      darkGlass: `linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))`,
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SF Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Effects
  effects: {
    backdropBlur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)',
      xl: 'blur(24px)',
    },
    
    backdropBrightness: {
      dark: 'brightness(0.5)',
      darker: 'brightness(0.3)',
    },
    
    backdropSaturate: {
      high: 'saturate(180%)',
    },
  },
  
  // Animation durations
  animation: {
    durations: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
    },
    
    easings: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Glass morphism presets
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
  },
};

/**
 * Light theme configuration
 */
export const lightTheme = {
  ...darkTheme,
  name: 'light',
  colors: {
    ...darkTheme.colors,
    
    // Override dark theme colors for light theme
    background: {
      primary: COLORS.GRAY_50,
      secondary: COLORS.GRAY_100,
      tertiary: COLORS.GRAY_200,
      card: COLORS.WHITE,
      overlay: 'rgba(0, 0, 0, 0.5)',
      modal: COLORS.WHITE,
    },
    
    text: {
      primary: COLORS.GRAY_900,
      secondary: COLORS.GRAY_700,
      tertiary: COLORS.GRAY_500,
      inverted: COLORS.WHITE,
      link: COLORS.PRIMARY_DARK,
      placeholder: COLORS.GRAY_400,
    },
    
    border: {
      primary: COLORS.GRAY_300,
      secondary: COLORS.GRAY_200,
      accent: COLORS.PRIMARY,
      error: COLORS.ERROR,
      success: COLORS.SUCCESS,
    },
    
    input: {
      background: COLORS.WHITE,
      border: COLORS.GRAY_300,
      text: COLORS.GRAY_900,
      placeholder: COLORS.GRAY_400,
      focus: {
        border: COLORS.PRIMARY,
        shadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
      },
      error: {
        border: COLORS.ERROR,
        background: 'rgba(239, 68, 68, 0.05)',
      },
      success: {
        border: COLORS.SUCCESS,
        background: 'rgba(34, 197, 94, 0.05)',
      },
    },
    
    card: {
      background: COLORS.WHITE,
      border: COLORS.GRAY_200,
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      hover: {
        background: COLORS.GRAY_50,
        border: COLORS.PRIMARY,
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    
    table: {
      background: COLORS.WHITE,
      header: {
        background: COLORS.GRAY_50,
        text: COLORS.GRAY_700,
        border: COLORS.GRAY_200,
      },
      row: {
        background: 'transparent',
        hover: COLORS.GRAY_50,
        border: COLORS.GRAY_200,
      },
    },
    
    navigation: {
      background: COLORS.WHITE,
      item: {
        background: 'transparent',
        text: COLORS.GRAY_700,
        hover: COLORS.GRAY_100,
        active: {
          background: 'rgba(139, 92, 246, 0.1)',
          text: COLORS.PRIMARY,
          border: COLORS.PRIMARY,
        },
      },
    },
    
    glass: {
      light: {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      medium: {
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      dark: {
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      },
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(139, 92, 246, 0.2)',
  },
};

/**
 * Get CSS variables for a theme
 * @param {Object} theme - Theme object
 * @returns {Object} - CSS variables object
 */
export const getThemeCSSVariables = (theme = darkTheme) => {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-primary-dark': theme.colors.primaryDark,
    '--color-secondary': theme.colors.secondary,
    '--color-secondary-light': theme.colors.secondaryLight,
    '--color-secondary-dark': theme.colors.secondaryDark,
    '--color-tertiary': theme.colors.tertiary,
    '--color-tertiary-light': theme.colors.tertiaryLight,
    '--color-tertiary-dark': theme.colors.tertiaryDark,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,
    '--color-text-primary': theme.colors.text.primary,
    '--color-text-secondary': theme.colors.text.secondary,
    '--color-text-tertiary': theme.colors.text.tertiary,
    '--color-bg-primary': theme.colors.background.primary,
    '--color-bg-secondary': theme.colors.background.secondary,
    '--color-bg-tertiary': theme.colors.background.tertiary,
    '--color-card-bg': theme.colors.card.background,
    '--color-border': theme.colors.border.primary,
    '--radius-sm': theme.borderRadius.sm,
    '--radius-md': theme.borderRadius.md,
    '--radius-lg': theme.borderRadius.lg,
    '--radius-xl': theme.borderRadius.xl,
    '--radius-2xl': theme.borderRadius['2xl'],
    '--radius-full': theme.borderRadius.full,
    '--spacing-1': theme.spacing[1],
    '--spacing-2': theme.spacing[2],
    '--spacing-3': theme.spacing[3],
    '--spacing-4': theme.spacing[4],
    '--spacing-5': theme.spacing[5],
    '--spacing-6': theme.spacing[6],
    '--spacing-8': theme.spacing[8],
    '--spacing-10': theme.spacing[10],
    '--spacing-12': theme.spacing[12],
    '--transition-fast': theme.transitions.fast,
    '--transition-base': theme.transitions.base,
    '--transition-slow': theme.transitions.slow,
    '--font-sans': theme.typography.fontFamily.sans,
    '--font-mono': theme.typography.fontFamily.mono,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl,
    '--shadow-glow': theme.shadows.glow,
  };
};

/**
 * Apply theme to document
 * @param {Object} theme - Theme object
 */
export const applyTheme = (theme = darkTheme) => {
  const cssVariables = getThemeCSSVariables(theme);
  
  Object.entries(cssVariables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.background.primary);
  }
  
  // Add theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme.name}`);
};

/**
 * Get current theme based on system preference or stored preference
 * @returns {Object} - Current theme
 */
export const getCurrentTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme === 'light' ? lightTheme : darkTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return lightTheme;
  }
  
  return darkTheme;
};

/**
 * Toggle between light and dark theme
 * @returns {Object} - New theme
 */
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme.name === 'dark' ? lightTheme : darkTheme;
  
  localStorage.setItem('theme', newTheme.name);
  applyTheme(newTheme);
  
  return newTheme;
};

/**
 * Initialize theme on page load
 */
export const initializeTheme = () => {
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? lightTheme : darkTheme;
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
};

/**
 * Create a custom theme by merging with base theme
 * @param {Object} customConfig - Custom theme configuration
 * @returns {Object} - Custom theme
 */
export const createCustomTheme = (customConfig) => {
  const baseTheme = darkTheme;
  
  // Deep merge custom config with base theme
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };
  
  return deepMerge(JSON.parse(JSON.stringify(baseTheme)), customConfig);
};

/**
 * Generate color palette from base color
 * @param {string} baseColor - Base color in hex format
 * @returns {Object} - Color palette
 */
export const generateColorPalette = (baseColor) => {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  
  const lightenColor = (rgb, amount) => {
    return {
      r: Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount)),
      g: Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount)),
      b: Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount)),
    };
  };
  
  const darkenColor = (rgb, amount) => {
    return {
      r: Math.max(0, rgb.r - Math.round(rgb.r * amount)),
      g: Math.max(0, rgb.g - Math.round(rgb.g * amount)),
      b: Math.max(0, rgb.b - Math.round(rgb.b * amount)),
    };
  };
  
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) return null;
  
  return {
    50: rgbToHex(...Object.values(lightenColor(baseRgb, 0.9))),
    100: rgbToHex(...Object.values(lightenColor(baseRgb, 0.7))),
    200: rgbToHex(...Object.values(lightenColor(baseRgb, 0.5))),
    300: rgbToHex(...Object.values(lightenColor(baseRgb, 0.3))),
    400: rgbToHex(...Object.values(lightenColor(baseRgb, 0.1))),
    500: baseColor,
    600: rgbToHex(...Object.values(darkenColor(baseRgb, 0.1))),
    700: rgbToHex(...Object.values(darkenColor(baseRgb, 0.3))),
    800: rgbToHex(...Object.values(darkenColor(baseRgb, 0.5))),
    900: rgbToHex(...Object.values(darkenColor(baseRgb, 0.7))),
  };
};

/**
 * Check if color is light
 * @param {string} color - Color in hex format
 * @returns {boolean} - True if color is light
 */
export const isLightColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

/**
 * Get contrasting text color for background
 * @param {string} backgroundColor - Background color in hex format
 * @returns {string} - Text color (black or white)
 */
export const getContrastTextColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? COLORS.GRAY_900 : COLORS.WHITE;
};

export default {
  dark: darkTheme,
  light: lightTheme,
  getThemeCSSVariables,
  applyTheme,
  getCurrentTheme,
  toggleTheme,
  initializeTheme,
  createCustomTheme,
  generateColorPalette,
  isLightColor,
  getContrastTextColor,
};