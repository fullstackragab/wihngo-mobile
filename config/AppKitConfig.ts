/**
 * Reown AppKit Configuration
 * Configures wallet connection for Solana network only
 * Supports USDC and EURC payments via Solana Pay
 */

import "@walletconnect/react-native-compat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAppKit, solana } from "@reown/appkit-react-native";
import {
  PhantomConnector,
  SolanaAdapter,
  SolflareConnector,
} from "@reown/appkit-solana-react-native";

// Storage adapter for Reown AppKit using AsyncStorage
const storage = {
  async getKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith("appkit:"));
  },

  async getEntries<T = any>(): Promise<[string, T][]> {
    const keys = await this.getKeys();
    const entries = await Promise.all(
      keys.map(async (key) => {
        const value = await this.getItem<T>(key);
        return [key, value] as [string, T];
      })
    );
    return entries.filter(([_, value]) => value !== undefined);
  },

  async getItem<T = any>(key: string): Promise<T | undefined> {
    const value = await AsyncStorage.getItem(`appkit:${key}`);
    return value ? JSON.parse(value) : undefined;
  },

  async setItem<T = any>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(`appkit:${key}`, JSON.stringify(value));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`appkit:${key}`);
  },
};

// Get project ID from environment
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn("Missing EXPO_PUBLIC_REOWN_PROJECT_ID in .env");
}

// Initialize Solana adapter only
const solanaAdapter = new SolanaAdapter();

// Define networks for crypto payment system - Solana only
const networks = [
  solana, // Solana for USDC and EURC
];

// Create AppKit instance
export const appKit = createAppKit({
  projectId,
  networks,
  defaultNetwork: solana,
  adapters: [solanaAdapter],
  storage,

  // Extra connectors for Phantom and Solflare wallets
  extraConnectors: [new PhantomConnector(), new SolflareConnector()],

  // Metadata for your dApp
  metadata: {
    name: "Wihngo",
    description: "Support birds and conservation with crypto payments",
    url: "https://wihngo.com",
    icons: ["https://wihngo.com/icon.png"],
    redirect: {
      native: "wihngo://",
      universal: "wihngo.com",
    },
  },
});

export default appKit;
