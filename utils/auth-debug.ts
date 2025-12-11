/**
 * Authentication Debugging Utilities
 * Helper functions to diagnose auth state issues
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

/**
 * Check current authentication state in AsyncStorage
 * Useful for debugging auth issues
 */
export async function debugAuthState(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);

    console.log("🔍 Auth Debug State:");
    console.log("  Token exists:", !!token);
    console.log("  Token length:", token?.length || 0);
    console.log(
      "  Token preview:",
      token ? `${token.substring(0, 20)}...` : "null"
    );
    console.log("  User exists:", !!user);
    console.log("  User data:", user ? JSON.parse(user) : null);
  } catch (error) {
    console.error("❌ Error debugging auth state:", error);
  }
}

/**
 * Get all AsyncStorage keys related to authentication
 */
export async function listAuthKeys(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(
      (key) =>
        key.includes("auth") || key.includes("token") || key.includes("user")
    );
    console.log("🔑 Auth-related keys:", authKeys);
    return authKeys;
  } catch (error) {
    console.error("❌ Error listing auth keys:", error);
    return [];
  }
}

/**
 * Clear all authentication data (for testing)
 */
export async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, TOKEN_EXPIRY_KEY]);
    console.log("🧹 Auth data cleared");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
}
