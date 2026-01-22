// Theme Constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Color Constants
export const COLORS = {
  // Primary Colors
  PRIMARY: '#8b5cf6',
  PRIMARY_LIGHT: '#a78bfa',
  PRIMARY_DARK: '#7c3aed',
  
  // Secondary Colors
  SECONDARY: '#60a5fa',
  SECONDARY_LIGHT: '#93c5fd',
  SECONDARY_DARK: '#3b82f6',
  
  // Tertiary Colors
  TERTIARY: '#10b981',
  TERTIARY_LIGHT: '#34d399',
  TERTIARY_DARK: '#059669',
  
  // Status Colors
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#60a5fa',
  
  // Neutral Colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f8fafc',
  GRAY_100: '#f1f5f9',
  GRAY_200: '#e2e8f0',
  GRAY_300: '#cbd5e1',
  GRAY_400: '#94a3b8',
  GRAY_500: '#64748b',
  GRAY_600: '#475569',
  GRAY_700: '#334155',
  GRAY_800: '#1e293b',
  GRAY_900: '#0f172a',
  GRAY_950: '#020617',
};

// Spacing Constants (4px base unit)
export const SPACING = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// Border Radius Constants
export const BORDER_RADIUS = {
  none: '0',
  sm: '2px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
};

// Transition Constants
export const TRANSITIONS = {
  fast: '150ms ease',
  base: '250ms ease',
  slow: '350ms ease',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Shadow Constants
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(139, 92, 246, 0.3)',
};

// Font Constants
export const FONTS = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'SF Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
};

// Font Size Constants
export const FONT_SIZES = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
  '8xl': '96px',
  '9xl': '128px',
};

// Font Weight Constants
export const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Line Height Constants
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Z-Index Constants
export const Z_INDEX = {
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
};

// Breakpoint Constants
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// API Constants
export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  RECENT_SEARCHES: 'recent_searches',
  CART_DATA: 'cart_data',
  ANALYTICS_PREFERENCES: 'analytics_preferences',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'hh:mm a',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  ISO: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

// Currency Constants
export const CURRENCY = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    code: 'USD',
    decimalPlaces: 2,
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    code: 'EUR',
    decimalPlaces: 2,
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    code: 'GBP',
    decimalPlaces: 2,
  },
  JPY: {
    symbol: '¥',
    name: 'Japanese Yen',
    code: 'JPY',
    decimalPlaces: 0,
  },
};

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

// Analytics Constants
export const ANALYTICS = {
  EVENT_TYPES: {
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    FILE_UPLOAD: 'file_upload',
    ERROR: 'error',
    AUTH: 'auth',
    NAVIGATION: 'navigation',
    SEARCH: 'search',
    EXPORT: 'export',
  },
  METRICS: {
    REVENUE: 'revenue',
    TRANSACTIONS: 'transactions',
    AVG_ORDER_VALUE: 'avg_order_value',
    CUSTOMERS: 'customers',
    ITEMS_SOLD: 'items_sold',
    PROFIT_MARGIN: 'profit_margin',
  },
  DATE_RANGES: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST_7_DAYS: '7d',
    LAST_30_DAYS: '30d',
    LAST_90_DAYS: '90d',
    LAST_YEAR: '1y',
    CUSTOM: 'custom',
  },
};

// Notification Constants
export const NOTIFICATION = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  CHANNELS: {
    EMAIL: 'email',
    PUSH: 'push',
    SMS: 'sms',
    IN_APP: 'in_app',
  },
};

// Export Constants for CSS Variables
export const CSS_VARIABLES = {
  '--color-primary': COLORS.PRIMARY,
  '--color-primary-light': COLORS.PRIMARY_LIGHT,
  '--color-primary-dark': COLORS.PRIMARY_DARK,
  '--color-secondary': COLORS.SECONDARY,
  '--color-secondary-light': COLORS.SECONDARY_LIGHT,
  '--color-secondary-dark': COLORS.SECONDARY_DARK,
  '--color-tertiary': COLORS.TERTIARY,
  '--color-tertiary-light': COLORS.TERTIARY_LIGHT,
  '--color-tertiary-dark': COLORS.TERTIARY_DARK,
  '--color-success': COLORS.SUCCESS,
  '--color-warning': COLORS.WARNING,
  '--color-error': COLORS.ERROR,
  '--color-info': COLORS.INFO,
  '--color-text-primary': COLORS.GRAY_100,
  '--color-text-secondary': COLORS.GRAY_400,
  '--color-text-tertiary': COLORS.GRAY_600,
  '--color-bg-primary': COLORS.GRAY_950,
  '--color-bg-secondary': COLORS.GRAY_900,
  '--color-bg-tertiary': COLORS.GRAY_800,
  '--color-border': COLORS.GRAY_800,
  '--color-card-bg': 'rgba(255, 255, 255, 0.05)',
  '--spacing-1': SPACING[1],
  '--spacing-2': SPACING[2],
  '--spacing-3': SPACING[3],
  '--spacing-4': SPACING[4],
  '--spacing-5': SPACING[5],
  '--spacing-6': SPACING[6],
  '--spacing-8': SPACING[8],
  '--spacing-10': SPACING[10],
  '--spacing-12': SPACING[12],
  '--radius-sm': BORDER_RADIUS.sm,
  '--radius-md': BORDER_RADIUS.md,
  '--radius-lg': BORDER_RADIUS.lg,
  '--radius-xl': BORDER_RADIUS.xl,
  '--radius-2xl': BORDER_RADIUS['2xl'],
  '--radius-full': BORDER_RADIUS.full,
  '--transition-fast': TRANSITIONS.fast,
  '--transition-base': TRANSITIONS.base,
  '--transition-slow': TRANSITIONS.slow,
  '--font-sans': FONTS.sans,
  '--font-mono': FONTS.mono,
  '--shadow-sm': SHADOWS.sm,
  '--shadow-md': SHADOWS.md,
  '--shadow-lg': SHADOWS.lg,
  '--shadow-xl': SHADOWS.xl,
  '--shadow-glow': SHADOWS.glow,
};