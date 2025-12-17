/**
 * Network Check Utility
 * Provides network connectivity checking for API requests
 */

import { NetworkError } from "@/contexts/network-context";
import i18n from "@/i18n";
import NetInfo from "@react-native-community/netinfo";

/**
 * Check if the device has network connectivity
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export async function isNetworkConnected(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Check network connectivity and throw NetworkError if offline
 * Use this before making API requests
 * @throws NetworkError if device is offline
 */
export async function ensureNetworkConnectivity(): Promise<void> {
  const connected = await isNetworkConnected();
  if (!connected) {
    console.warn("📵 Network check failed: Device is offline");
    throw new NetworkError(i18n.t("network.noConnection"));
  }
}

/**
 * Wrapper function that checks network before executing an async operation
 * @param operation - The async operation to execute
 * @returns The result of the operation
 * @throws NetworkError if device is offline
 */
export async function withNetworkCheck<T>(
  operation: () => Promise<T>
): Promise<T> {
  await ensureNetworkConnectivity();
  return operation();
}
