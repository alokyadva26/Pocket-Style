/**
 * =============================================================================
 * PocketStylist — Design System & Theme Constants
 * =============================================================================
 * 
 * Centralized design tokens for the entire application.
 * All colors, typography, spacing, and shadows are defined here
 * to maintain consistency across the app.
 */

export const COLORS = {
  // Primary palette — Deep violet / purple gradient
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  primaryGlow: 'rgba(124, 58, 237, 0.25)',

  // Accent — Warm coral for CTAs and highlights
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  accentDark: '#DB2777',

  // Background layers — Rich dark mode
  background: '#0D0D0D',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  surfaceElevated: '#2D2D4A',

  // Text hierarchy
  textPrimary: '#F8F8FF',
  textSecondary: '#A0A0C0',
  textMuted: '#6B6B8D',
  textInverse: '#0D0D0D',

  // Semantic colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Category colors — Unique color per clothing category
  categoryTop: '#60A5FA',
  categoryBottom: '#34D399',
  categoryFootwear: '#FBBF24',
  categoryAccessory: '#F472B6',

  // Occasion tag colors
  occasionCasual: '#60A5FA',
  occasionFormal: '#A78BFA',
  occasionParty: '#F472B6',
  occasionSports: '#34D399',

  // Borders and dividers
  border: '#2A2A4A',
  borderLight: '#3A3A5A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const TYPOGRAPHY = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 48,

  // Font weights (as strings for React Native)
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Clothing categories with their visual properties
export const CATEGORIES = [
  { id: 'tops', label: 'Tops', icon: '👕', color: COLORS.categoryTop },
  { id: 'bottoms', label: 'Bottoms', icon: '👖', color: COLORS.categoryBottom },
  { id: 'footwear', label: 'Footwear', icon: '👟', color: COLORS.categoryFootwear },
  { id: 'accessories', label: 'Accessories', icon: '⌚', color: COLORS.categoryAccessory },
];

// Occasion tags with their visual properties
export const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: '☀️', color: COLORS.occasionCasual },
  { id: 'formal', label: 'Formal', icon: '💼', color: COLORS.occasionFormal },
  { id: 'party', label: 'Party', icon: '🎉', color: COLORS.occasionParty },
  { id: 'sports', label: 'Sports', icon: '🏃', color: COLORS.occasionSports },
];
