/**
 * Payment Status Types - Updated v2.0
 * Defines types for payment status polling and checking
 */

// Supported payment currencies - Breaking Change v2.0
export type SupportedCurrency = "USDT" | "USDC" | "ETH" | "BNB";

// Supported payment networks - Breaking Change v2.0
export type SupportedNetwork = "tron" | "ethereum" | "binance-smart-chain";

// Valid currency-network combinations
export interface CurrencyNetworkMap {
  USDT: ("tron" | "ethereum" | "binance-smart-chain")[];
  USDC: ("ethereum" | "binance-smart-chain")[];
  ETH: ["ethereum"];
  BNB: ["binance-smart-chain"];
}

export const VALID_COMBINATIONS: CurrencyNetworkMap = {
  USDT: ["tron", "ethereum", "binance-smart-chain"],
  USDC: ["ethereum", "binance-smart-chain"],
  ETH: ["ethereum"],
  BNB: ["binance-smart-chain"],
};

export interface PaymentStatus {
  id: string;
  userId: string;
  birdId?: string;
  amountUsd: number;
  amountCrypto: number;
  currency: SupportedCurrency;
  network: SupportedNetwork;
  exchangeRate: number;
  walletAddress: string;
  addressIndex?: number;
  userWalletAddress?: string;
  qrCodeData: string;
  paymentUri: string;
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  status:
    | "pending"
    | "confirming"
    | "confirmed"
    | "completed"
    | "expired"
    | "cancelled"
    | "failed";
  purpose: string;
  plan?: string;
  expiresAt: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusCheckResponse {
  id: string;
  status:
    | "pending"
    | "confirming"
    | "confirmed"
    | "completed"
    | "expired"
    | "cancelled"
    | "failed";
  confirmations: number;
  requiredConfirmations: number;
  transactionHash?: string;
  currency: SupportedCurrency;
  network: SupportedNetwork;
  amountCrypto: number;
  walletAddress: string;
  addressIndex?: number;
  confirmedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

// Payment creation request
export interface CreatePaymentRequest {
  amountUsd: number;
  currency: SupportedCurrency;
  network: SupportedNetwork;
  purpose: "premium_subscription" | "bird_adoption" | "donation" | "custom";
  plan?: "monthly" | "yearly";
  birdId?: string;
}

// Helper function to validate currency-network combination
export const isValidCombination = (
  currency: string,
  network: string
): boolean => {
  const validNetworks = VALID_COMBINATIONS[currency as SupportedCurrency];
  return validNetworks?.includes(network as any) ?? false;
};
