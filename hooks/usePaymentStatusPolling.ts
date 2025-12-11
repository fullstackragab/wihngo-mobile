/**
 * Payment Status Polling Hook
 * Custom hook for polling cryptocurrency payment status
 */

import { PaymentStatus } from "@/types/payment";
import { useCallback, useEffect, useRef, useState } from "react";

const POLLING_INTERVAL = 5000; // 5 seconds
const TERMINAL_STATUSES = [
  "confirmed",
  "completed",
  "expired",
  "cancelled",
  "failed",
] as const;

interface UsePaymentStatusPollingOptions {
  paymentId: string;
  authToken: string;
  enabled?: boolean;
  onStatusChange?: (status: PaymentStatus) => void;
}

interface UsePaymentStatusPollingReturn {
  status: PaymentStatus["status"] | null;
  confirmations: number;
  requiredConfirmations: number;
  loading: boolean;
  error: string | null;
  paymentData: PaymentStatus | null;
  forceCheck: () => Promise<void>;
}

/**
 * Hook to poll payment status at regular intervals
 *
 * @param paymentId - The ID of the payment to check
 * @param authToken - Authentication bearer token
 * @param enabled - Whether polling is enabled (default: true)
 * @param onStatusChange - Callback fired when status changes
 * @returns Payment status data and control functions
 */
export function usePaymentStatusPolling({
  paymentId,
  authToken,
  enabled = true,
  onStatusChange,
}: UsePaymentStatusPollingOptions): UsePaymentStatusPollingReturn {
  const [status, setStatus] = useState<PaymentStatus["status"] | null>(null);
  const [confirmations, setConfirmations] = useState(0);
  const [requiredConfirmations, setRequiredConfirmations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const previousStatusRef = useRef<PaymentStatus["status"] | null>(null);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    console.log("⏹️ Stopping payment status polling");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Check payment status from API
   * Uses the check-status endpoint for automatic transaction detection
   */
  const checkPaymentStatus = useCallback(async (): Promise<void> => {
    if (!paymentId || !authToken) {
      setError("Missing payment ID or auth token");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
      const endpoint = `${API_URL}/payments/crypto/${paymentId}/check-status`;

      console.log(
        "🔄 Checking payment status (automatic detection):",
        paymentId
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("🌐 Response received:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: PaymentStatus = await response.json();

      if (!isMountedRef.current) return;

      console.log("✅ Payment status received:", {
        status: data.status,
        confirmations: data.confirmations,
        requiredConfirmations: data.requiredConfirmations,
        transactionHash: data.transactionHash,
        autoDetected:
          !data.transactionHash && data.status === "pending"
            ? "scanning"
            : "detected",
      });

      // Update state
      setPaymentData(data);
      setStatus(data.status);
      setConfirmations(data.confirmations);
      setRequiredConfirmations(data.requiredConfirmations);

      // Call status change callback if status changed
      if (previousStatusRef.current !== data.status) {
        console.log(
          `📊 Status changed: ${previousStatusRef.current} → ${data.status}`
        );
        previousStatusRef.current = data.status;
        onStatusChange?.(data);
      }

      // Stop polling if terminal status reached
      if (TERMINAL_STATUSES.includes(data.status as any)) {
        console.log(
          "🛑 Terminal status reached, stopping polling:",
          data.status
        );
        stopPolling();
      }
    } catch (err: any) {
      console.error("❌ Payment status check failed:", err);

      if (!isMountedRef.current) return;

      const errorMessage = err.message || "Failed to check payment status";
      setError(errorMessage);

      // Don't stop polling on error - keep trying
      console.log("⚠️ Error occurred but continuing to poll...");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [paymentId, authToken, onStatusChange, stopPolling]);

  /**
   * Force an immediate status check
   */
  const forceCheck = useCallback(async (): Promise<void> => {
    console.log("🔄 Force check triggered");
    await checkPaymentStatus();
  }, [checkPaymentStatus]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    console.log("▶️ Starting payment status polling");

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Do immediate check
    checkPaymentStatus();

    // Set up interval
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, POLLING_INTERVAL);
  }, [checkPaymentStatus]);

  /**
   * Effect: Start/stop polling based on enabled flag
   */
  useEffect(() => {
    isMountedRef.current = true;

    console.log("🎛️ Polling effect triggered:", {
      enabled,
      paymentId,
      hasToken: !!authToken,
      willStartPolling: enabled && paymentId && authToken,
    });

    if (enabled && paymentId && authToken) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [enabled, paymentId, authToken, startPolling, stopPolling]);

  return {
    status,
    confirmations,
    requiredConfirmations,
    loading,
    error,
    paymentData,
    forceCheck,
  };
}
