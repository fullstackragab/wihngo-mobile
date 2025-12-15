/**
 * Payment Method Configuration - v2.0
 * Updated crypto payment methods with only supported currencies
 * Breaking Change: Removed BTC, SOL, MATIC, Sepolia support
 * Flow: Network selection first, then currency selection
 */

import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";

export interface PaymentMethod {
  id: string;
  name: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  icon: string; // FontAwesome icon name
  badge?: string;
  badgeColor?: string;
  estimatedFee: string;
  estimatedTime: string;
  description: string;
  advantages: string[];
  confirmations: number;
  enabled: boolean;
  sortOrder: number;
}

export interface NetworkOption {
  network: CryptoNetwork;
  name: string;
  icon: string;
  description: string;
  estimatedFee: string;
  estimatedTime: string;
  confirmations: number;
  badge?: string;
  badgeColor?: string;
  advantages: string[];
  supportedCurrencies: CryptoCurrency[];
}

/**
 * Available networks for selection (Step 1) - Only Solana
 */
export const NETWORK_OPTIONS: NetworkOption[] = [
  {
    network: "solana",
    name: "Solana",
    icon: "bolt",
    description: "Fastest, lowest fees",
    estimatedFee: "~$0.00025",
    estimatedTime: "~1 sec",
    confirmations: 1,
    badge: "RECOMMENDED",
    badgeColor: "#14F195",
    advantages: [
      "Lowest fees ($0.0003)",
      "Fastest (~1 sec)",
      "Modern technology",
    ],
    supportedCurrencies: ["USDC", "EURC"],
  },
];

/**
 * Payment methods configuration - Only Solana
 * Ordered by recommendation (USDC first, then EURC)
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // USDC on Solana
  {
    id: "usdc-solana",
    name: "USDC (Solana)",
    currency: "USDC",
    network: "solana",
    icon: "dollar-sign",
    badge: "RECOMMENDED",
    badgeColor: "#14F195",
    estimatedFee: "~$0.00025",
    estimatedTime: "~1 sec",
    description: "Fastest and cheapest option",
    advantages: ["Lowest fees", "Instant", "Modern technology"],
    confirmations: 1,
    enabled: true,
    sortOrder: 1,
  },
  // EURC on Solana
  {
    id: "eurc-solana",
    name: "EURC (Solana)",
    currency: "EURC",
    network: "solana",
    icon: "euro-sign",
    estimatedFee: "~$0.00025",
    estimatedTime: "~1 sec",
    description: "Euro stablecoin, fastest network",
    advantages: ["Euro-backed", "Lowest fees", "Instant"],
    confirmations: 1,
    enabled: true,
    sortOrder: 2,
  },
];

/**
 * Get enabled payment methods sorted by priority
 */
export const getEnabledPaymentMethods = (): PaymentMethod[] =>
  PAYMENT_METHODS.filter((m) => m.enabled).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

/**
 * Get payment method by ID
 */
export const getPaymentMethodById = (id: string): PaymentMethod | undefined =>
  PAYMENT_METHODS.find((m) => m.id === id);

/**
 * Get payment methods for a specific currency
 */
export const getPaymentMethodsForCurrency = (
  currency: CryptoCurrency
): PaymentMethod[] =>
  PAYMENT_METHODS.filter((m) => m.currency === currency && m.enabled);

/**
 * Get payment methods for a specific network
 */
export const getPaymentMethodsForNetwork = (
  network: CryptoNetwork
): PaymentMethod[] =>
  PAYMENT_METHODS.filter((m) => m.network === network && m.enabled);

/**
 * Get the recommended payment method (USDC on Solana)
 */
export const getRecommendedPaymentMethod = (): PaymentMethod =>
  PAYMENT_METHODS[0]; // USDC on Solana

/**
 * Get payment methods by fee category - Only Solana (all low fee)
 */
export const getPaymentMethodsByFeeCategory = (
  category: "low" | "medium" | "high"
): PaymentMethod[] => {
  // All Solana methods are low fee
  if (category === "low") {
    return PAYMENT_METHODS.filter((m) => m.enabled);
  }
  return [];
};

/**
 * Get available currencies for a network (Step 2 after network selection)
 */
export const getCurrenciesForNetwork = (
  network: CryptoNetwork
): CryptoCurrency[] => {
  const networkOption = NETWORK_OPTIONS.find((n) => n.network === network);
  return networkOption?.supportedCurrencies || [];
};

/**
 * Get network option by network ID
 */
export const getNetworkOption = (
  network: CryptoNetwork
): NetworkOption | undefined => {
  return NETWORK_OPTIONS.find((n) => n.network === network);
};

/**
 * Get all available networks
 */
export const getAvailableNetworks = (): NetworkOption[] => {
  return NETWORK_OPTIONS;
};

/**
 * Get the recommended network (Solana)
 */
export const getRecommendedNetwork = (): NetworkOption => {
  return NETWORK_OPTIONS[0]; // Solana
};

/**
 * Get payment method for specific network and currency combination
 */
export const getPaymentMethodForCombination = (
  network: CryptoNetwork,
  currency: CryptoCurrency
): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(
    (m) => m.network === network && m.currency === currency && m.enabled
  );
};
