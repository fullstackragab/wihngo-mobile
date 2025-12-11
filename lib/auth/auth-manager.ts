/**
 * Centralized Authentication Manager
 * Single source of truth for authentication state and token management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Centralized storage keys - MUST match across all files
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  TOKEN_EXPIRY: "auth_token_expiry",
} as const;

// Token expiry duration (24 hours)
const TOKEN_EXPIRY_DURATION = 24 * 60 * 60 * 1000;

/**
 * Save authentication token with expiry
 */
export async function saveAuthToken(token: string): Promise<void> {
  const expiryTime = Date.now() + TOKEN_EXPIRY_DURATION;
  await Promise.all([
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token),
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
  ]);
  console.log(
    "✅ Token saved with expiry:",
    new Date(expiryTime).toISOString()
  );
}

/**
 * Get authentication token if valid
 * Returns null if token doesn't exist or is expired
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const [token, expiryTimeStr] = await Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY),
    ]);

    if (!token) {
      console.log("⚠️ No token found");
      return null;
    }

    // Check token expiration
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      if (Date.now() > expiryTime) {
        console.log("⏰ Token expired, clearing auth data");
        await clearAuthData();
        return null;
      }
    }

    return token;
  } catch (error) {
    console.error("❌ Error getting auth token:", error);
    return null;
  }
}

/**
 * Check if user is authenticated with valid token
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Clear all authentication data
 */
export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([
    AUTH_STORAGE_KEYS.TOKEN,
    AUTH_STORAGE_KEYS.USER,
    AUTH_STORAGE_KEYS.TOKEN_EXPIRY,
  ]);
  console.log("🧹 Auth data cleared");
}

/**
 * Get token time remaining in milliseconds
 */
export async function getTokenTimeRemaining(): Promise<number> {
  try {
    const expiryTimeStr = await AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.TOKEN_EXPIRY
    );
    if (!expiryTimeStr) return 0;

    const expiryTime = parseInt(expiryTimeStr, 10);
    return Math.max(0, expiryTime - Date.now());
  } catch {
    return 0;
  }
}

/**
 * Check if token will expire soon (within 1 hour)
 */
export async function isTokenExpiringSoon(): Promise<boolean> {
  const timeRemaining = await getTokenTimeRemaining();
  return timeRemaining < 60 * 60 * 1000; // Less than 1 hour
}
