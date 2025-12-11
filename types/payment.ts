/**
 * Payment Status Types
 * Defines types for payment status polling and checking
 */

export interface PaymentStatus {
  id: string;
  userId: string;
  birdId?: string;
  amountUsd: number;
  amountCrypto: number;
  currency: string;
  network: string;
  exchangeRate: number;
  walletAddress: string;
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
  currency: string;
  network: string;
  amountCrypto: number;
  walletAddress: string;
  confirmedAt?: string;
  completedAt?: string;
  updatedAt: string;
}
