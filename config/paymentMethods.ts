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
 * Available networks for selection (Step 1)
 */
export const NETWORK_OPTIONS: NetworkOption[] = [
  {
    network: "tron",
    name: "Tron (TRC-20)",
    icon: "coins",
    description: "Lowest fees, fastest confirmations",
    estimatedFee: "~$0.01",
    estimatedTime: "~1 min",
    confirmations: 19,
    badge: "RECOMMENDED",
    badgeColor: "#00D4FF",
    advantages: ["Lowest fees ($0.01)", "Very fast (1 min)", "Most popular"],
    supportedCurrencies: ["USDT", "USDC"],
  },
  {
    network: "binance-smart-chain",
    name: "Binance Smart Chain (BEP-20)",
    icon: "b",
    description: "Low fees, multiple tokens",
    estimatedFee: "~$0.05",
    estimatedTime: "~1 min",
    confirmations: 15,
    advantages: ["Low fees ($0.05)", "Fast (1 min)", "Multiple tokens"],
    supportedCurrencies: ["USDT", "USDC", "BNB"],
  },
  {
    network: "ethereum",
    name: "Ethereum (ERC-20)",
    icon: "ethereum",
    description: "Most trusted, higher fees",
    estimatedFee: "$5-50",
    estimatedTime: "~3 min",
    confirmations: 12,
    badge: "MOST TRUSTED",
    badgeColor: "#627EEA",
    advantages: ["Most secure", "Most trusted", "Multiple tokens"],
    supportedCurrencies: ["USDT", "USDC", "ETH"],
  },
];

/**
 * Payment methods configuration
 * Ordered by recommendation (cheapest/fastest first)
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // RECOMMENDED - Show first
  {
    id: "usdt-tron",
    name: "USDT (Tron)",
    currency: "USDT",
    network: "tron",
    icon: "dollar-sign",
    badge: "RECOMMENDED",
    badgeColor: "#00D4FF",
    estimatedFee: "~$0.01",
    estimatedTime: "~1 min",
    description: "Cheapest and fastest option",
    advantages: ["Lowest fees", "Very fast", "Most popular"],
    confirmations: 19,
    enabled: true,
    sortOrder: 1,
  },

  {
    id: "usdc-tron",
    name: "USDC (Tron)",
    currency: "USDC",
    network: "tron",
    icon: "dollar-sign",
    badge: "RECOMMENDED",
    badgeColor: "#00D4FF",
    estimatedFee: "~$0.01",
    estimatedTime: "~1 min",
    description: "Regulated stablecoin, lowest fees",
    advantages: ["FDIC-backed", "Lowest fees", "Very fast"],
    confirmations: 19,
    enabled: true,
    sortOrder: 2,
  },

  // Low-fee alternatives
  {
    id: "usdt-bsc",
    name: "USDT (BSC)",
    currency: "USDT",
    network: "binance-smart-chain",
    icon: "dollar-sign",
    estimatedFee: "~$0.05",
    estimatedTime: "~1 min",
    description: "Low fee alternative",
    advantages: ["Low fees", "Fast", "Reliable"],
    confirmations: 15,
    enabled: true,
    sortOrder: 3,
  },

  {
    id: "usdc-bsc",
    name: "USDC (BSC)",
    currency: "USDC",
    network: "binance-smart-chain",
    icon: "dollar-sign",
    estimatedFee: "~$0.05",
    estimatedTime: "~1 min",
    description: "USDC on low-fee network",
    advantages: ["Regulated stablecoin", "Low fees", "Fast"],
    confirmations: 15,
    enabled: true,
    sortOrder: 4,
  },

  // Ethereum options - higher fees but most trusted
  {
    id: "usdc-ethereum",
    name: "USDC (Ethereum)",
    currency: "USDC",
    network: "ethereum",
    icon: "dollar-sign",
    badge: "MOST TRUSTED",
    badgeColor: "#627EEA",
    estimatedFee: "$5-50",
    estimatedTime: "~3 min",
    description: "Most trusted stablecoin",
    advantages: ["Regulated", "FDIC-backed", "Most secure"],
    confirmations: 12,
    enabled: true,
    sortOrder: 5,
  },

  {
    id: "usdt-ethereum",
    name: "USDT (Ethereum)",
    currency: "USDT",
    network: "ethereum",
    icon: "dollar-sign",
    estimatedFee: "$5-50",
    estimatedTime: "~3 min",
    description: "USDT on Ethereum network",
    advantages: ["Most liquid", "Widely accepted"],
    confirmations: 12,
    enabled: true,
    sortOrder: 6,
  },

  // Native tokens - for users who hold these
  {
    id: "eth",
    name: "ETH",
    currency: "ETH",
    network: "ethereum",
    icon: "ethereum",
    estimatedFee: "$5-50",
    estimatedTime: "~3 min",
    description: "Native Ethereum",
    advantages: ["Native token", "Widely held"],
    confirmations: 12,
    enabled: true,
    sortOrder: 7,
  },

  {
    id: "bnb",
    name: "BNB",
    currency: "BNB",
    network: "binance-smart-chain",
    icon: "b",
    estimatedFee: "~$0.05",
    estimatedTime: "~1 min",
    description: "Native BSC token",
    advantages: ["Low fees", "Fast", "Popular"],
    confirmations: 15,
    enabled: true,
    sortOrder: 8,
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
 * Get the recommended payment method (USDT on Tron)
 */
export const getRecommendedPaymentMethod = (): PaymentMethod =>
  PAYMENT_METHODS[0]; // USDT on Tron

/**
 * Get payment methods by fee category
 */
export const getPaymentMethodsByFeeCategory = (
  category: "low" | "medium" | "high"
): PaymentMethod[] => {
  const feeCategories: Record<string, "low" | "medium" | "high"> = {
    "usdt-tron": "low",
    "usdt-bsc": "low",
    "usdc-bsc": "low",
    bnb: "low",
    "usdc-ethereum": "high",
    "usdt-ethereum": "high",
    eth: "high",
  };

  return PAYMENT_METHODS.filter(
    (m) => feeCategories[m.id] === category && m.enabled
  );
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
 * Get the recommended network (Tron)
 */
export const getRecommendedNetwork = (): NetworkOption => {
  return NETWORK_OPTIONS[0]; // Tron
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
