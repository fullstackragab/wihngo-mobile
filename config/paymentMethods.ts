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
  {
    network: "stellar",
    name: "Stellar",
    icon: "star",
    description: "Ultra-low fees, fast",
    estimatedFee: "~$0.00001",
    estimatedTime: "~5 sec",
    confirmations: 1,
    advantages: [
      "Minimal fees ($0.00001)",
      "Very fast (5 sec)",
      "Optimized for payments",
    ],
    supportedCurrencies: ["USDC", "EURC"],
  },
  {
    network: "base",
    name: "Base",
    icon: "layer-group",
    description: "Low fees, Ethereum L2",
    estimatedFee: "~$0.05",
    estimatedTime: "~24 sec",
    confirmations: 12,
    advantages: ["Low fees ($0.05)", "Ethereum ecosystem", "Fast (24 sec)"],
    supportedCurrencies: ["USDC", "EURC"],
  },
  {
    network: "polygon",
    name: "Polygon",
    icon: "hexagon",
    description: "Low fees, Ethereum compatible",
    estimatedFee: "~$0.01",
    estimatedTime: "~4.5 min",
    confirmations: 128,
    advantages: ["Low fees ($0.01)", "Ethereum compatible", "Widely supported"],
    supportedCurrencies: ["USDC", "EURC"],
  },
  {
    network: "ethereum",
    name: "Ethereum",
    icon: "ethereum",
    description: "Most trusted, higher fees",
    estimatedFee: "$1-5",
    estimatedTime: "~2.4 min",
    confirmations: 12,
    badge: "MOST TRUSTED",
    badgeColor: "#627EEA",
    advantages: ["Most secure", "Most trusted", "Largest ecosystem"],
    supportedCurrencies: ["USDC", "EURC"],
  },
];

/**
 * Payment methods configuration
 * Ordered by recommendation (cheapest/fastest first)
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // RECOMMENDED - Solana (fastest and cheapest)
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

  {
    id: "eurc-solana",
    name: "EURC (Solana)",
    currency: "EURC",
    network: "solana",
    icon: "euro-sign",
    badge: "RECOMMENDED",
    badgeColor: "#14F195",
    estimatedFee: "~$0.00025",
    estimatedTime: "~1 sec",
    description: "Euro stablecoin, fastest network",
    advantages: ["Euro-backed", "Lowest fees", "Instant"],
    confirmations: 1,
    enabled: true,
    sortOrder: 2,
  },

  // Stellar - Ultra-low fees
  {
    id: "usdc-stellar",
    name: "USDC (Stellar)",
    currency: "USDC",
    network: "stellar",
    icon: "dollar-sign",
    estimatedFee: "~$0.00001",
    estimatedTime: "~5 sec",
    description: "Minimal fees, very fast",
    advantages: ["Minimal fees", "Very fast", "Payment-focused"],
    confirmations: 1,
    enabled: true,
    sortOrder: 3,
  },

  {
    id: "eurc-stellar",
    name: "EURC (Stellar)",
    currency: "EURC",
    network: "stellar",
    icon: "euro-sign",
    estimatedFee: "~$0.00001",
    estimatedTime: "~5 sec",
    description: "Euro stablecoin, minimal fees",
    advantages: ["Euro-backed", "Minimal fees", "Very fast"],
    confirmations: 1,
    enabled: true,
    sortOrder: 4,
  },

  // Base - Low-fee Ethereum L2
  {
    id: "usdc-base",
    name: "USDC (Base)",
    currency: "USDC",
    network: "base",
    icon: "dollar-sign",
    estimatedFee: "~$0.05",
    estimatedTime: "~24 sec",
    description: "Low-fee Ethereum L2",
    advantages: ["Low fees", "Ethereum ecosystem", "Fast"],
    confirmations: 12,
    enabled: true,
    sortOrder: 5,
  },

  {
    id: "eurc-base",
    name: "EURC (Base)",
    currency: "EURC",
    network: "base",
    icon: "euro-sign",
    estimatedFee: "~$0.05",
    estimatedTime: "~24 sec",
    description: "Euro stablecoin on Base L2",
    advantages: ["Euro-backed", "Low fees", "Ethereum ecosystem"],
    confirmations: 12,
    enabled: true,
    sortOrder: 6,
  },

  // Polygon - Low fees
  {
    id: "usdc-polygon",
    name: "USDC (Polygon)",
    currency: "USDC",
    network: "polygon",
    icon: "dollar-sign",
    estimatedFee: "~$0.01",
    estimatedTime: "~4.5 min",
    description: "Low fees, Ethereum compatible",
    advantages: ["Low fees", "Ethereum compatible", "Widely supported"],
    confirmations: 128,
    enabled: true,
    sortOrder: 7,
  },

  {
    id: "eurc-polygon",
    name: "EURC (Polygon)",
    currency: "EURC",
    network: "polygon",
    icon: "euro-sign",
    estimatedFee: "~$0.01",
    estimatedTime: "~4.5 min",
    description: "Euro stablecoin on Polygon",
    advantages: ["Euro-backed", "Low fees", "Ethereum compatible"],
    confirmations: 128,
    enabled: true,
    sortOrder: 8,
  },

  // Ethereum - Most trusted but higher fees
  {
    id: "usdc-ethereum",
    name: "USDC (Ethereum)",
    currency: "USDC",
    network: "ethereum",
    icon: "dollar-sign",
    badge: "MOST TRUSTED",
    badgeColor: "#627EEA",
    estimatedFee: "$1-5",
    estimatedTime: "~2.4 min",
    description: "Most trusted network",
    advantages: ["Most secure", "Most trusted", "Largest ecosystem"],
    confirmations: 12,
    enabled: true,
    sortOrder: 9,
  },

  {
    id: "eurc-ethereum",
    name: "EURC (Ethereum)",
    currency: "EURC",
    network: "ethereum",
    icon: "euro-sign",
    badge: "MOST TRUSTED",
    badgeColor: "#627EEA",
    estimatedFee: "$1-5",
    estimatedTime: "~2.4 min",
    description: "Euro stablecoin on Ethereum",
    advantages: ["Euro-backed", "Most secure", "Most trusted"],
    confirmations: 12,
    enabled: true,
    sortOrder: 10,
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
 * Get payment methods by fee category
 */
export const getPaymentMethodsByFeeCategory = (
  category: "low" | "medium" | "high"
): PaymentMethod[] => {
  const feeCategories: Record<string, "low" | "medium" | "high"> = {
    "usdc-solana": "low",
    "eurc-solana": "low",
    "usdc-stellar": "low",
    "eurc-stellar": "low",
    "usdc-base": "low",
    "eurc-base": "low",
    "usdc-polygon": "low",
    "eurc-polygon": "low",
    "usdc-ethereum": "high",
    "eurc-ethereum": "high",
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
