/**
 * Payout Types
 * Multi-payout strategy for Wihngo
 */

export type PayoutMethodType =
  | "iban"
  | "paypal"
  | "usdc-solana"
  | "eurc-solana"
  | "usdc-base"
  | "eurc-base";

export type PayoutMethod = {
  id?: string;
  userId: string;
  methodType: PayoutMethodType;
  isDefault: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  // IBAN/SEPA specific
  accountHolderName?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  // PayPal specific
  paypalEmail?: string;
  // Crypto specific
  walletAddress?: string;
  network?: "solana" | "base";
  currency?: "usdc" | "eurc";
};

export type PayoutSettings = {
  userId: string;
  minimumPayoutAmount: number; // Default: 20
  payoutFrequency: "monthly" | "quarterly"; // Default: monthly
  preferredCurrency: "EUR" | "USD";
  methods: PayoutMethod[];
};

export type PayoutHistoryItem = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PayoutMethodType;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  platformFee: number; // 5%
  providerFee: number;
  netAmount: number;
  scheduledAt: string;
  processedAt?: string;
  failureReason?: string;
  transactionId?: string;
};

export type PayoutBalance = {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  nextPayoutDate: string;
  minimumReached: boolean;
};

export type AddPayoutMethodDto = {
  methodType: PayoutMethodType;
  isDefault: boolean;
  // IBAN/SEPA
  accountHolderName?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  // PayPal
  paypalEmail?: string;
  // Crypto
  walletAddress?: string;
  network?: "solana" | "base";
  currency?: "usdc" | "eurc";
};

export type UpdatePayoutMethodDto = {
  methodId: string;
  isDefault?: boolean;
  // Update capability for non-sensitive fields
};

export type PayoutSummary = {
  totalEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  platformFeePaid: number;
  providerFeesPaid: number;
  currency: string;
};
