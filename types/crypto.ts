/**
 * Crypto Payment Types
 * Defines types for cryptocurrency payment functionality
 */

// Updated payment currencies - Breaking Change v2.0
export type CryptoCurrency =
  | "USDC" // USD Coin
  | "EURC"; // Euro Coin

// Updated supported networks - Only Solana (v3.0)
export type CryptoNetwork = "solana";

/**
 * Network confirmation requirements - Only Solana (v3.0)
 * Solana: 1 block (~400ms finalized)
 */
export const NETWORK_CONFIRMATIONS: Record<CryptoNetwork, number> = {
  solana: 1,
};

export type CryptoPaymentStatus =
  | "pending" // Payment initiated, awaiting confirmation
  | "confirming" // Transaction detected, awaiting confirmations
  | "confirmed" // Payment confirmed
  | "completed" // Payment completed and credited
  | "expired" // Payment window expired
  | "cancelled" // Payment cancelled by user
  | "failed"; // Payment failed

export type CryptoPaymentMethod = {
  id: string;
  userId: string;
  walletAddress: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  label?: string; // User-friendly name like "My Bitcoin Wallet"
  isDefault: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CryptoPaymentRequest = {
  id: string;
  userId: string;
  birdId?: string; // If this is for a bird premium subscription

  // Amount details
  amountUsd: number; // Original amount in USD
  amountCrypto: number; // Converted amount in crypto
  currency: CryptoCurrency;
  network: CryptoNetwork;
  exchangeRate: number; // Rate used for conversion

  // Payment details
  walletAddress: string; // Our receiving address (unique HD-derived address)
  addressIndex?: number; // HD wallet derivation index
  userWalletAddress?: string; // User's sending address (if provided)
  qrCodeData: string; // QR code string for payment
  paymentUri: string; // Payment URI (bitcoin:, ethereum:, etc.)

  // Transaction details
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;

  status: CryptoPaymentStatus;
  purpose: "premium_subscription" | "donation" | "purchase";
  plan?: "monthly" | "yearly" | "lifetime"; // For premium subscriptions

  // Timing
  expiresAt: string; // Payment window expiration
  confirmedAt?: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreateCryptoPaymentDto = {
  birdId?: string;
  amountUsd: number;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  purpose: "premium_subscription" | "donation" | "purchase";
  plan?: "monthly" | "yearly" | "lifetime"; // If purpose is premium_subscription
  userWalletAddress?: string;
};

export type CryptoPaymentResponse = {
  paymentRequest: CryptoPaymentRequest;
  message: string;
};

export type VerifyCryptoPaymentDto = {
  transactionHash: string;
  userWalletAddress?: string;
};

export type CryptoExchangeRate = {
  currency: CryptoCurrency;
  usdRate: number;
  lastUpdated: string;
  source: string;
};

export type CryptoWalletInfo = {
  currency: CryptoCurrency;
  network: CryptoNetwork;
  address: string;
  qrCode: string;
  isActive: boolean;
};

export type CryptoTransaction = {
  id: string;
  paymentRequestId: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  confirmations: number;
  blockNumber?: number;
  fee: number;
  status: "pending" | "confirmed" | "failed";
  detectedAt: string;
  confirmedAt?: string;
};

export type CryptoPaymentHistory = {
  payments: CryptoPaymentRequest[];
  total: number;
  page: number;
  pageSize: number;
};

export type SaveCryptoWalletDto = {
  walletAddress: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  label?: string;
};

// UI-specific types
export type CryptoCurrencyInfo = {
  code: CryptoCurrency;
  name: string;
  symbol: string;
  iconName: string;
  networks: CryptoNetwork[];
  minAmount: number; // Minimum payment amount in USD
  confirmationsRequired: number;
  estimatedTime: string; // e.g., "10-30 minutes"
  decimals: Record<CryptoNetwork, number>; // Important: BEP-20 USDT uses 18 decimals!
};

export type CryptoPaymentStep =
  | "select-currency"
  | "select-network"
  | "review-amount"
  | "payment-address"
  | "awaiting-payment"
  | "confirming"
  | "completed"
  | "failed";

/**
 * Network to Currency Mapping - Only Solana (v3.0)
 * Both USDC and EURC are supported on Solana
 * Default to USDC for backward compatibility
 */
export const NETWORK_TO_CURRENCY: Record<CryptoNetwork, CryptoCurrency> = {
  solana: "USDC",
};

/**
 * Get currency for a specific network
 */
export function getCurrencyForNetwork(network: CryptoNetwork): CryptoCurrency {
  return NETWORK_TO_CURRENCY[network] || "USDC";
}

/**
 * Valid currency-network combinations - Updated v2.0
 * Both USDC and EURC are supported on all networks:
 * - Ethereum, Solana, Polygon, Base, Stellar
 */
export interface CurrencyNetworkMap {
  USDC: "solana"[];
  EURC: "solana"[];
}

export const VALID_COMBINATIONS: CurrencyNetworkMap = {
  USDC: ["solana"],
  EURC: ["solana"],
};

/**
 * Check if a currency-network combination is valid
 */
export function isValidCurrencyNetwork(
  currency: CryptoCurrency,
  network: CryptoNetwork
): boolean {
  const validNetworks = VALID_COMBINATIONS[currency];
  return validNetworks?.includes(network as any) ?? false;
}

/**
 * Get available currencies for a specific network
 */
export function getCurrenciesForNetwork(
  network: CryptoNetwork
): CryptoCurrency[] {
  const currencies: CryptoCurrency[] = [];

  // Check each currency to see if it supports this network
  (Object.keys(VALID_COMBINATIONS) as CryptoCurrency[]).forEach((currency) => {
    if (VALID_COMBINATIONS[currency].includes(network as any)) {
      currencies.push(currency);
    }
  });

  return currencies;
}
