/**
 * Payout Types
 * Multi-payout strategy for Wihngo
 * Updated to match backend API documentation
 */

export type PayoutMethodType = "BankTransfer" | "PayPal" | "Wise" | "Solana";

export type PayoutMethod = {
  id?: string;
  userId: string;
  methodType: PayoutMethodType;
  isDefault: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Bank Transfer/IBAN/SEPA specific
  accountHolderName?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  // PayPal specific
  payPalEmail?: string;
  // Crypto specific (Solana only)
  walletAddress?: string;
  network?: string; // e.g., "solana-mainnet", "solana-devnet"
  currency?: string; // "USDC" or "EURC"
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
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  methodType: PayoutMethodType;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  providerTransactionId?: string;
};

export type PayoutBalance = {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  currency: string;
  minimumPayout: number;
  nextPayoutDate?: string;
  lastPayoutDate?: string;
  lastPayoutAmount?: number;
};

export type AddPayoutMethodDto = {
  methodType: PayoutMethodType;
  isDefault?: boolean;
  // Bank Transfer/IBAN/SEPA
  accountHolderName?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  // PayPal
  payPalEmail?: string;
  // Crypto (Solana only)
  walletAddress?: string;
  network?: string;
  currency?: string;
};

export type UpdatePayoutMethodDto = {
  isDefault?: boolean;
};

export type PayoutSummary = {
  totalEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  platformFeePaid: number;
  providerFeesPaid: number;
  currency: string;
};
