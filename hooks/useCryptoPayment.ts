/**
 * Crypto Payment Hook
 * Custom React hook for managing cryptocurrency payments
 */

import {
  CreateCryptoPaymentDto,
  CryptoCurrency,
  CryptoExchangeRate,
  CryptoNetwork,
  CryptoPaymentHistory,
  CryptoPaymentRequest,
  CryptoWalletInfo,
} from "@/types/crypto";
import { useCallback, useState } from "react";
import { CryptoPaymentAPI } from "../services/cryptoPaymentApi";

interface UseCryptoPaymentReturn {
  payment: CryptoPaymentRequest | null;
  loading: boolean;
  error: string | null;
  createPayment: (
    paymentData: CreateCryptoPaymentDto
  ) => Promise<CryptoPaymentRequest | null>;
  verifyPayment: (
    paymentId: string,
    txHash: string,
    walletAddress?: string
  ) => Promise<CryptoPaymentRequest | null>;
  checkStatus: (paymentId: string) => Promise<CryptoPaymentRequest | null>;
  cancelPayment: (paymentId: string) => Promise<CryptoPaymentRequest | null>;
  getPaymentHistory: (
    page?: number,
    pageSize?: number
  ) => Promise<CryptoPaymentHistory | null>;
  getExchangeRates: () => Promise<CryptoExchangeRate[] | null>;
  getExchangeRate: (
    currency: CryptoCurrency
  ) => Promise<CryptoExchangeRate | null>;
  getPlatformWallet: (
    currency: CryptoCurrency,
    network: CryptoNetwork
  ) => Promise<CryptoWalletInfo | null>;
  clearError: () => void;
  setPayment: (payment: CryptoPaymentRequest | null) => void;
}

/**
 * Hook for managing crypto payment operations
 * @param authToken - JWT authentication token
 * @returns Payment state and control functions
 */
export function useCryptoPayment(authToken: string): UseCryptoPaymentReturn {
  const [api] = useState(() => new CryptoPaymentAPI(authToken));
  const [payment, setPayment] = useState<CryptoPaymentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create a new payment request
   */
  const createPayment = useCallback(
    async (
      paymentData: CreateCryptoPaymentDto
    ): Promise<CryptoPaymentRequest | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.createPayment(paymentData);
        setPayment(result.paymentRequest);
        return result.paymentRequest;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create payment";
        setError(errorMessage);
        console.error("❌ Create payment error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Verify a payment with transaction hash
   */
  const verifyPayment = useCallback(
    async (
      paymentId: string,
      txHash: string,
      walletAddress?: string
    ): Promise<CryptoPaymentRequest | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.verifyPayment(
          paymentId,
          txHash,
          walletAddress
        );
        setPayment(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to verify payment";
        setError(errorMessage);
        console.error("❌ Verify payment error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Check payment status (force blockchain check)
   */
  const checkStatus = useCallback(
    async (paymentId: string): Promise<CryptoPaymentRequest | null> => {
      try {
        const result = await api.checkPaymentStatus(paymentId);
        setPayment(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to check status";
        console.error("❌ Check status error:", errorMessage);
        // Don't set error state for status checks (polling should be silent)
        return null;
      }
    },
    [api]
  );

  /**
   * Cancel a pending payment
   */
  const cancelPayment = useCallback(
    async (paymentId: string): Promise<CryptoPaymentRequest | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.cancelPayment(paymentId);
        setPayment(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel payment";
        setError(errorMessage);
        console.error("❌ Cancel payment error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Get payment history
   */
  const getPaymentHistory = useCallback(
    async (
      page: number = 1,
      pageSize: number = 20
    ): Promise<CryptoPaymentHistory | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getPaymentHistory(page, pageSize);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get payment history";
        setError(errorMessage);
        console.error("❌ Get payment history error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Get all exchange rates
   */
  const getExchangeRates = useCallback(async (): Promise<
    CryptoExchangeRate[] | null
  > => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getExchangeRates();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get exchange rates";
      setError(errorMessage);
      console.error("❌ Get exchange rates error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * Get exchange rate for specific currency
   */
  const getExchangeRate = useCallback(
    async (currency: CryptoCurrency): Promise<CryptoExchangeRate | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getExchangeRate(currency);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get exchange rate";
        setError(errorMessage);
        console.error("❌ Get exchange rate error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Get platform wallet info
   */
  const getPlatformWallet = useCallback(
    async (
      currency: CryptoCurrency,
      network: CryptoNetwork
    ): Promise<CryptoWalletInfo | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getPlatformWallet(currency, network);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get platform wallet";
        setError(errorMessage);
        console.error("❌ Get platform wallet error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    payment,
    loading,
    error,
    createPayment,
    verifyPayment,
    checkStatus,
    cancelPayment,
    getPaymentHistory,
    getExchangeRates,
    getExchangeRate,
    getPlatformWallet,
    clearError,
    setPayment,
  };
}

export default useCryptoPayment;
