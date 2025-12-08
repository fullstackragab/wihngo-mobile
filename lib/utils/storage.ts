import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage utilities for managing local storage
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PROFILE: "user_profile",
  THEME_PREFERENCE: "theme_preference",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;

/**
 * Save data to storage
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    throw error;
  }
}

/**
 * Get data from storage
 */
export async function getFromStorage<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting from storage (${key}):`, error);
    return null;
  }
}

/**
 * Remove data from storage
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    throw error;
  }
}

/**
 * Clear all storage
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing storage:", error);
    throw error;
  }
}

/**
 * Get multiple items from storage
 */
export async function getMultipleFromStorage(
  keys: string[]
): Promise<Record<string, any>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, any> = {};

    pairs.forEach(([key, value]) => {
      result[key] = value ? JSON.parse(value) : null;
    });

    return result;
  } catch (error) {
    console.error("Error getting multiple from storage:", error);
    return {};
  }
}
