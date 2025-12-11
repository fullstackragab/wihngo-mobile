/**
 * Crypto Payment Types
 * Defines types for cryptocurrency payment functionality
 */

export type CryptoCurrency =
  | "BTC" // Bitcoin
  | "ETH" // Ethereum
  | "USDT" // Tether
  | "USDC" // USD Coin
  | "BNB" // Binance Coin
  | "SOL" // Solana
  | "DOGE"; // Dogecoin

export type CryptoNetwork =
  | "bitcoin"
  | "ethereum"
  | "binance-smart-chain"
  | "solana"
  | "polygon"
  | "tron";

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
  walletAddress: string; // Our receiving address
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
