/**
 * Whingo Design System
 * Modern color palette and typography for the Whingo app
 */

import { Platform } from "react-native";

const tintColorLight = "#4ECDC4";
const tintColorDark = "#4ECDC4";

export const Colors = {
  light: {
    text: "#2C3E50",
    background: "#F8F9FA",
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
    border: "#E0E0E0",
    inputBackground: "#FFFFFF",
    placeholder: "#95A5A6",

    // Text Colors
    textPrimary: "#2C3E50",
    textSecondary: "#7F8C8D",
    textMuted: "#95A5A6",

    // Special Colors
    heartRed: "#FF6B6B",
    birdBlue: "#667EEA",
    supportGreen: "#10b981",
  },
  dark: {
    text: "#F8F9FA",
    background: "#1A202C",
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
    border: "#4A5568",
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
