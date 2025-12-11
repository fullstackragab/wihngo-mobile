/**
 * Crypto Payment Types
 * Defines types for cryptocurrency payment functionality
 */

export type CryptoCurrency =
  | "BTC" // Bitcoin
  | "ETH" // Ethereum (includes mainnet and Sepolia testnet)
  | "USDT" // Tether (TRC-20, ERC-20, BEP-20)
  | "USDC" // USD Coin (ERC-20, BEP-20)
  | "BNB" // Binance Coin
  | "SOL" // Solana
  | "DOGE"; // Dogecoin

export type CryptoNetwork =
  | "bitcoin"
  | "ethereum"
  | "binance-smart-chain"
  | "solana"
  | "polygon"
  | "tron"
  | "sepolia"; // Ethereum Sepolia Testnet

/**
 * Network confirmation requirements
 * Tron: 19 blocks (~57 seconds)
 * Ethereum: 12 blocks (~2.4 minutes)
 * BSC: 15 blocks (~45 seconds)
 * Sepolia: 6 blocks (~1.2 minutes) - Testnet only
 */
export const NETWORK_CONFIRMATIONS: Record<CryptoNetwork, number> = {
  tron: 19,
  ethereum: 12,
  "binance-smart-chain": 15,
  bitcoin: 6,
  polygon: 128,
  solana: 32,
  sepolia: 6, // Ethereum Sepolia Testnet
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
 * Network to Currency Mapping
 * Defines which currency is used for each network
 */
export const NETWORK_TO_CURRENCY: Record<CryptoNetwork, CryptoCurrency> = {
  sepolia: "ETH", // Sepolia testnet uses native ETH
  ethereum: "USDT", // Ethereum mainnet typically uses USDT
  tron: "USDT", // Tron uses USDT (TRC-20)
  "binance-smart-chain": "USDT", // BSC uses USDT (BEP-20)
  bitcoin: "BTC", // Bitcoin network uses BTC
  polygon: "USDT", // Polygon uses USDT
  solana: "SOL", // Solana uses native SOL
};

/**
 * Get currency for a specific network
 */
export function getCurrencyForNetwork(network: CryptoNetwork): CryptoCurrency {
  return NETWORK_TO_CURRENCY[network] || "USDT";
}

/**
 * Check if a currency-network combination is valid
 */
export function isValidCurrencyNetwork(
  currency: CryptoCurrency,
  network: CryptoNetwork
): boolean {
  const validCombinations: Record<CryptoCurrency, CryptoNetwork[]> = {
    ETH: ["ethereum", "sepolia"],
    USDT: ["tron", "ethereum", "binance-smart-chain", "polygon"],
    USDC: ["ethereum", "binance-smart-chain", "polygon"],
    BTC: ["bitcoin"],
    BNB: ["binance-smart-chain"],
    SOL: ["solana"],
    DOGE: [],
  };
  return validCombinations[currency]?.includes(network) || false;
}
