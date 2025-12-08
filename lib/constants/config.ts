import Constants from "expo-constants";

/**
 * Environment Configuration
 * Centralized configuration management for the application
 */

// API Configuration
export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api/";

export const API_CONFIG = {
  baseUrl: API_URL,
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
} as const;

// Feature Flags
export const FEATURES = {
  enableNotifications: true,
  enableAnalytics: false, // Enable in production
  enableOfflineMode: false, // Future feature
  enablePushNotifications: false, // Requires setup
  enablePremium: true,
} as const;

// Pagination Configuration
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  compressionQuality: 0.8,
} as const;

// Validation Rules
export const VALIDATION = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  minUsernameLength: 3,
  maxUsernameLength: 30,
  maxBioLength: 500,
  maxStoryContentLength: 2000,
  maxStoryTitleLength: 100,
  maxCommentLength: 500,
  minBirdNameLength: 2,
  maxBirdNameLength: 50,
  maxBirdDescriptionLength: 1000,
} as const;

// App Metadata
export const APP_METADATA = {
  name: "Wihngo",
  description: "Celebrate and support birds together",
  version: Constants.expoConfig?.version || "1.0.0",
  buildNumber: Constants.expoConfig?.ios?.buildNumber || "1",
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  website: "https://wihngo.com",
  twitter: "https://twitter.com/wihngo",
  instagram: "https://instagram.com/wihngo",
  support: "mailto:support@wihngo.com",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PROFILE: "user_profile",
  THEME_PREFERENCE: "theme_preference",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;
