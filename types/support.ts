export type SupportTransaction = {
  transactionId: string;
  supporterId: string;
  birdId?: string;
  amount: number; // User's intended donation amount
  platformFee: number; // 5% platform fee (minimum $1)
  totalAmount: number; // Total amount charged (amount + platformFee)
  paymentProvider: string;
  paymentId: string;
  status: string;
  createdAt: string;
};

export type SupportTransactionCreateDto = {
  supporterId: string;
  birdId?: string;
  amount: number; // User's intended donation amount
  platformFee: number; // 5% platform fee (minimum $1)
  totalAmount: number; // Total amount charged
  paymentProvider: string;
  paymentId: string;
  status: string;
};

// Platform fee configuration
export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
export const MINIMUM_PLATFORM_FEE = 1.0; // $1 minimum fee
export const MINIMUM_DONATION_AMOUNT = 10.0; // $10 minimum donation

/**
 * Calculate platform fee for a donation/support amount
 * @param amount The donation amount
 * @returns The platform fee (5% with $1 minimum)
 */
export function calculatePlatformFee(amount: number): number {
  const calculatedFee = amount * PLATFORM_FEE_PERCENTAGE;
  return Math.max(calculatedFee, MINIMUM_PLATFORM_FEE);
}

/**
 * Calculate total amount including platform fee
 * @param amount The donation amount
 * @returns Object with amount breakdown
 */
export function calculateTotalAmount(amount: number): {
  amount: number;
  platformFee: number;
  totalAmount: number;
} {
  const platformFee = calculatePlatformFee(amount);
  const totalAmount = amount + platformFee;
  return { amount, platformFee, totalAmount };
}
