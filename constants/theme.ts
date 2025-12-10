/**
 * Whingo Design System
 * Modern, breathing design with emphasis on white space and elegance
 */

import { Platform } from "react-native";

const tintColorLight = "#4ECDC4";
const tintColorDark = "#4ECDC4";

// Spacing system for consistent breathing room
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography scale - smaller, more refined sizes
export const Typography = {
  hero: 32, // Large titles
  h1: 24, // Section titles
  h2: 20, // Card titles
  h3: 16, // Subsections
  body: 14, // Regular text
  small: 12, // Secondary text
  tiny: 10, // Captions
};

// Border radius for consistent shapes
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Colors = {
  light: {
    text: "#2C3E50",
    background: "#FFFFFF", // Pure white background
    backgroundAlt: "#F8F9FA", // Subtle grey for contrast
    tint: tintColorLight,
    icon: "#7F8C8D",
    tabIconDefault: "#95A5A6",
    tabIconSelected: tintColorLight,

    // Brand Colors
    primary: "#4ECDC4",
    primaryDark: "#44A08D",
    secondary: "#667EEA",
    accent: "#FFD93D",

    // Semantic Colors
    success: "#10b981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // UI Colors
    card: "#FFFFFF",
    border: "#F0F0F0", // Lighter borders
    borderLight: "#F8F8F8", // Very subtle borders
    inputBackground: "#FFFFFF",
    placeholder: "#A0A0A0",

    // Text Colors
    textPrimary: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textMuted: "#9E9E9E",

    // Special Colors
    heartRed: "#FF6B6B",
    birdBlue: "#667EEA",
    supportGreen: "#10b981",
  },
  dark: {
    text: "#F8F9FA",
    background: "#1A202C",
    backgroundAlt: "#2D3748",
    tint: tintColorDark,
    icon: "#A0AEC0",
    tabIconDefault: "#718096",
    tabIconSelected: tintColorDark,

    // Brand Colors
    primary: "#4ECDC4",
    primaryDark: "#44A08D",
    secondary: "#667EEA",
    accent: "#FFD93D",

    // Semantic Colors
    success: "#10b981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // UI Colors
    card: "#2D3748",
    border: "#374151",
    borderLight: "#2D3748",
    inputBackground: "#2D3748",
    placeholder: "#718096",

    // Text Colors
    textPrimary: "#F8F9FA",
    textSecondary: "#E2E8F0",
    textMuted: "#A0AEC0",

    // Special Colors
    heartRed: "#FF6B6B",
    birdBlue: "#667EEA",
    supportGreen: "#10b981",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Theme object for consistent styling across the app
export const theme = {
  colors: {
    primary: "#0a7ea4",
    primaryLight: "#e3f2fd",
    accent: "#FFD700",
    text: "#11181C",
    textSecondary: "#687076",
    background: "#fff",
    border: "#e0e0e0",
    error: "#f44336",
  },
};
