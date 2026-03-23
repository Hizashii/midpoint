import { Platform } from 'react-native';

export const colors = {
  // Primary: The Precision Blue
  primary: "#0058bc",
  "on-primary": "#ffffff",
  "primary-container": "#0070eb",
  "on-primary-container": "#fefcff",
  "inverse-primary": "#adc6ff",
  "primary-fixed": "#e3e9f5",
  "on-primary-fixed-variant": "#1a2a4a",

  // Secondary: Tonal Grays
  secondary: "#605e5e",
  "on-secondary": "#ffffff",
  "secondary-container": "#e6e1e1",
  "on-secondary-container": "#666464",

  // Tertiary: Calm Teal
  tertiary: "#006763",
  "on-tertiary": "#ffffff",
  "tertiary-container": "#14827c",
  "on-tertiary-container": "#f3fffd",
  "tertiary-fixed": "#96f3eb",
  "on-tertiary-fixed": "#00201e",

  // Surfaces: The Editorial Palette
  background: "#fdf8f8",
  surface: "#fdf8f8",
  "surface-bright": "#fdf8f8",
  "surface-dim": "#ddd9d8",
  "surface-container-lowest": "#ffffff",
  "surface-container-low": "#f7f2f2",
  "surface-container": "#f1edec",
  "surface-container-high": "#ece7e7",
  "surface-container-highest": "#e6e1e1",
  "on-surface": "#1c1b1b",
  "on-surface-variant": "#414755",
  "inverse-surface": "#313030",
  "inverse-on-surface": "#f4f0ef",

  // Outlines & Dividers
  outline: "#717786",
  "outline-variant": "#c1c6d7",

  // Functional
  error: "#ba1a1a",
  "on-error": "#ffffff",
  "error-container": "#ffdad6",
  "on-error-container": "#93000a",
};

export const typography = {
  fontFamily: {
    headline: Platform.select({ ios: "Manrope", android: "Manrope", web: "Manrope, system-ui, sans-serif" }),
    headlineBold: Platform.select({ ios: "Manrope-Bold", android: "Manrope-Bold", web: "Manrope, system-ui, sans-serif" }),
    headlineExtraBold: Platform.select({ ios: "Manrope-ExtraBold", android: "Manrope-ExtraBold", web: "Manrope, system-ui, sans-serif" }),
    headlineSemiBold: Platform.select({ ios: "Manrope-SemiBold", android: "Manrope-SemiBold", web: "Manrope, system-ui, sans-serif" }),
    body: Platform.select({ ios: "Inter", android: "Inter", web: "Inter, system-ui, sans-serif" }),
    bodyMedium: Platform.select({ ios: "Inter-Medium", android: "Inter-Medium", web: "Inter, system-ui, sans-serif" }),
    bodySemiBold: Platform.select({ ios: "Inter-SemiBold", android: "Inter-SemiBold", web: "Inter, system-ui, sans-serif" }),
    label: Platform.select({ ios: "Inter", android: "Inter", web: "Inter, system-ui, sans-serif" }),
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 28,
    "2xl": 32,
    "3xl": 38,
    "4xl": 44,
  }
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const shadows = {
  // Ultra-soft ambient shadows
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)' },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
    web: { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.06)' },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 32,
    },
    android: { elevation: 8 },
    web: { boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.08)' },
  }),
  ambient: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.05,
      shadowRadius: 48,
    },
    android: { elevation: 12 },
    web: { boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.05)' },
  })
};
