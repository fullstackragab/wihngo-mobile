/**
 * Crypto Payment API Service Class
 * Complete API wrapper for cryptocurrency payment operations
 * Based on backend API specification
 */

import {
  CreateCryptoPaymentDto,
  CryptoCurrency,
  CryptoExchangeRate,
  CryptoNetwork,
  CryptoPaymentHistory,
  CryptoPaymentRequest,
  CryptoPaymentResponse,
  CryptoWalletInfo,
  VerifyCryptoPaymentDto,
} from "@/types/crypto";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api") +
  "/payments/crypto";

export class CryptoPaymentAPI {
  private authToken: string;
  private baseURL: string;

  constructor(authToken: string) {
    this.authToken = authToken;
    this.baseURL = API_BASE_URL;
  }

  /**
   * Helper method to make API requests with proper headers
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Add authorization header if auth token is provided
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "An error occurred",
      }));
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    return response.json();
  }

  // ========== Public Endpoints (No Auth Required) ==========

  /**
   * Get exchange rates for all supported cryptocurrencies
   * @returns Array of exchange rates
   */
  async getExchangeRates(): Promise<CryptoExchangeRate[]> {
    return this.request<CryptoExchangeRate[]>("/rates", {
      method: "GET",
    });
  }

  /**
   * Get exchange rate for a specific cryptocurrency
   * @param currency - The cryptocurrency code (e.g., "USDT", "ETH")
   * @returns Exchange rate object
   */
  async getExchangeRate(currency: CryptoCurrency): Promise<CryptoExchangeRate> {
    return this.request<CryptoExchangeRate>(`/rates/${currency}`, {
      method: "GET",
    });
  }

  /**
   * Get platform wallet address for receiving payments
   * @param currency - The cryptocurrency code
   * @param network - The blockchain network
   * @returns Wallet information including address and QR code
   */
  async getPlatformWallet(
    currency: CryptoCurrency,
    network: CryptoNetwork
  ): Promise<CryptoWalletInfo> {
    return this.request<CryptoWalletInfo>(`/wallet/${currency}/${network}`, {
      method: "GET",
    });
  }

  // ========== Authenticated Endpoints ==========

  /**
   * Create a new crypto payment request
   * @param paymentData - Payment creation data
   * @returns Payment response with payment request details
   */
  async createPayment(
    paymentData: CreateCryptoPaymentDto
  ): Promise<CryptoPaymentResponse> {
    console.log("💰 Creating crypto payment:", {
      currency: paymentData.currency,
      network: paymentData.network,
      amountUsd: paymentData.amountUsd,
      purpose: paymentData.purpose,
    });

    const response = await this.request<CryptoPaymentResponse>("/create", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });

    console.log("✅ Payment created:", {
      paymentId: response.paymentRequest.id,
      expiresAt: response.paymentRequest.expiresAt,
      status: response.paymentRequest.status,
      amountCrypto: response.paymentRequest.amountCrypto,
      walletAddress: response.paymentRequest.walletAddress,
    });

    return response;
  }

  /**
   * Verify a crypto payment by submitting transaction hash
   * @param paymentId - The payment request ID
   * @param transactionHash - The blockchain transaction hash
   * @param userWalletAddress - Optional: User's wallet address
   * @returns Updated payment request
   */
  async verifyPayment(
    paymentId: string,
    transactionHash: string,
    userWalletAddress?: string
  ): Promise<CryptoPaymentRequest> {
    console.log("🔍 Verifying payment:", {
      paymentId,
      transactionHash,
    });

    const dto: VerifyCryptoPaymentDto = {
      transactionHash,
      userWalletAddress,
    };

    return this.request<CryptoPaymentRequest>(`/${paymentId}/verify`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  /**
   * Get payment status (automatically checks blockchain)
   * @param paymentId - The payment request ID
   * @returns Payment request with current status
   */
  async getPaymentStatus(paymentId: string): Promise<CryptoPaymentRequest> {
    return this.request<CryptoPaymentRequest>(`/${paymentId}`, {
      method: "GET",
    });
  }

  /**
   * Force check payment status (explicit blockchain verification)
   * @param paymentId - The payment request ID
   * @returns Payment request with updated status
   */
  async checkPaymentStatus(paymentId: string): Promise<CryptoPaymentRequest> {
    console.log("🔄 Checking payment status:", paymentId);

    const result = await this.request<CryptoPaymentRequest>(
      `/${paymentId}/check-status`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );

    console.log("📊 Payment status result:", {
      status: result.status,
      confirmations: result.confirmations,
      requiredConfirmations: result.requiredConfirmations,
    });

    return result;
  }

  /**
   * Get payment history for the authenticated user
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20)
   * @returns Paginated payment history
   */
  async getPaymentHistory(
    page: number = 1,
    pageSize: number = 20
  ): Promise<CryptoPaymentHistory> {
    return this.request<CryptoPaymentHistory>(
      `/history?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Cancel a pending crypto payment
   * @param paymentId - The payment request ID
   * @returns Updated payment request with cancelled status
   */
  async cancelPayment(paymentId: string): Promise<CryptoPaymentRequest> {
    console.log("❌ Cancelling payment:", paymentId);

    return this.request<CryptoPaymentRequest>(`/${paymentId}/cancel`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }
}

/**
 * Create a new CryptoPaymentAPI instance
 * @param authToken - JWT Bearer token
 * @returns CryptoPaymentAPI instance
 */
export function createCryptoPaymentAPI(authToken: string): CryptoPaymentAPI {
  return new CryptoPaymentAPI(authToken);
}

export default CryptoPaymentAPI;
