/**
 * Payment Analytics Helper
 * Track crypto payment events for monitoring and optimization
 */

import { PaymentMethod } from "@/config/paymentMethods";
import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";

// You can replace this with your actual analytics service (Firebase, Mixpanel, etc.)
interface AnalyticsService {
  logEvent: (eventName: string, params: Record<string, any>) => void;
}

// Mock analytics service - replace with your actual implementation
const analytics: AnalyticsService = {
  logEvent: (eventName: string, params: Record<string, any>) => {
    console.log(`📊 Analytics Event: ${eventName}`, params);
    // TODO: Replace with actual analytics service call
    // Example: Firebase Analytics
    // import analytics from '@react-native-firebase/analytics';
    // analytics().logEvent(eventName, params);
  },
};

/**
 * Track payment method selection
 */
export function trackPaymentMethodSelected(method: PaymentMethod) {
  analytics.logEvent("payment_method_selected", {
    currency: method.currency,
    network: method.network,
    method_id: method.id,
    fee_estimate: method.estimatedFee,
    estimated_time: method.estimatedTime,
    is_recommended: method.badge === "RECOMMENDED",
  });
}

/**
 * Track payment creation
 */
export function trackPaymentCreated(payment: {
  id: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  amountUsd: number;
  amountCrypto: number;
  addressIndex?: number;
  purpose: string;
  plan?: string;
}) {
  analytics.logEvent("payment_created", {
    payment_id: payment.id,
    currency: payment.currency,
    network: payment.network,
    amount_usd: payment.amountUsd,
    amount_crypto: payment.amountCrypto,
    has_hd_index: payment.addressIndex !== undefined,
    purpose: payment.purpose,
    plan: payment.plan,
  });
}

/**
 * Track payment status change
 */
export function trackPaymentStatusChanged(
  paymentId: string,
  oldStatus: string,
  newStatus: string,
  confirmations?: number
) {
  analytics.logEvent("payment_status_changed", {
    payment_id: paymentId,
    old_status: oldStatus,
    new_status: newStatus,
    confirmations: confirmations || 0,
  });
}

/**
 * Track payment completion
 */
export function trackPaymentCompleted(payment: {
  id: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  amountUsd: number;
  confirmations: number;
  createdAt: string;
  completedAt?: string;
}) {
  const timeToComplete = payment.completedAt
    ? new Date(payment.completedAt).getTime() -
      new Date(payment.createdAt).getTime()
    : 0;

  analytics.logEvent("payment_completed", {
    payment_id: payment.id,
    currency: payment.currency,
    network: payment.network,
    amount_usd: payment.amountUsd,
    time_to_complete_ms: timeToComplete,
    time_to_complete_min: Math.round(timeToComplete / 60000),
    confirmations: payment.confirmations,
  });
}

/**
 * Track payment expiration
 */
export function trackPaymentExpired(
  paymentId: string,
  currency: CryptoCurrency,
  network: CryptoNetwork,
  amountUsd: number
) {
  analytics.logEvent("payment_expired", {
    payment_id: paymentId,
    currency,
    network,
    amount_usd: amountUsd,
  });
}

/**
 * Track payment cancellation
 */
export function trackPaymentCancelled(
  paymentId: string,
  currency: CryptoCurrency,
  network: CryptoNetwork,
  reason?: string
) {
  analytics.logEvent("payment_cancelled", {
    payment_id: paymentId,
    currency,
    network,
    reason: reason || "user_cancelled",
  });
}

/**
 * Track payment error
 */
export function trackPaymentError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) {
  analytics.logEvent("payment_error", {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}

/**
 * Track manual transaction verification
 */
export function trackManualVerification(
  paymentId: string,
  transactionHash: string,
  success: boolean
) {
  analytics.logEvent("payment_manual_verification", {
    payment_id: paymentId,
    transaction_hash: transactionHash,
    success,
  });
}

/**
 * Track QR code scan
 */
export function trackQRCodeScan(
  paymentId: string,
  currency: CryptoCurrency,
  network: CryptoNetwork
) {
  analytics.logEvent("payment_qr_scanned", {
    payment_id: paymentId,
    currency,
    network,
  });
}

/**
 * Track payment method comparison view
 */
export function trackPaymentMethodsViewed(methodsCount: number) {
  analytics.logEvent("payment_methods_viewed", {
    methods_count: methodsCount,
  });
}

/**
 * Track payment screen navigation
 */
export function trackPaymentScreenNavigation(
  screen: string,
  paymentId?: string
) {
  analytics.logEvent("payment_screen_navigation", {
    screen,
    payment_id: paymentId,
  });
}
