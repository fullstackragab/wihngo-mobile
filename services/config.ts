import Constants from "expo-constants";

/**
 * API Configuration
 * Reads the API URL from app.config.ts based on environment
 */
export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api/";

/**
 * App Configuration
 */
export const APP_CONFIG = {
  apiUrl: API_URL,
  apiTimeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Feature Flags
 */
export const FEATURES = {
  enableNotifications: true,
  enableAnalytics: false, // Enable in production
  enableOfflineMode: false, // Future feature
  enablePushNotifications: false, // Requires setup
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
};

/**
 * Image configuration
 */
export const IMAGE_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  compressionQuality: 0.8,
};

/**
 * Validation rules
 */
export const VALIDATION = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  minUsernameLength: 3,
  maxUsernameLength: 30,
  maxBioLength: 500,
  maxStoryContentLength: 2000,
  maxStoryTitleLength: 100,
  maxCommentLength: 500,
};
