/**
 * Crypto Payment Service
 * Handles cryptocurrency payment operations
 */

import {
  CreateCryptoPaymentDto,
  CryptoCurrency,
  CryptoCurrencyInfo,
  CryptoExchangeRate,
  CryptoNetwork,
  CryptoPaymentHistory,
  CryptoPaymentMethod,
  CryptoPaymentRequest,
  CryptoPaymentResponse,
  CryptoWalletInfo,
  SaveCryptoWalletDto,
  VerifyCryptoPaymentDto,
} from "@/types/crypto";
import { apiHelper } from "./api-helper";

/**
 * Create a new crypto payment request
 */
export async function createCryptoPayment(
  dto: CreateCryptoPaymentDto
): Promise<CryptoPaymentResponse> {
  console.log("💰 Creating crypto payment:", {
    currency: dto.currency,
    network: dto.network,
    amountUsd: dto.amountUsd,
    purpose: dto.purpose,
  });
  const endpoint = `payments/crypto/create`;
  const response = await apiHelper.post<CryptoPaymentResponse>(endpoint, dto);

  // Debug the response
  console.log("💰 Crypto payment response:", {
    paymentId: response.paymentRequest.id,
    expiresAt: response.paymentRequest.expiresAt,
    status: response.paymentRequest.status,
    amountCrypto: response.paymentRequest.amountCrypto,
    walletAddress: response.paymentRequest.walletAddress,
  });

  return response;
}

/**
 * Get crypto payment request by ID
 */
export async function getCryptoPayment(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  const endpoint = `payments/crypto/${paymentId}`;
  return apiHelper.get<CryptoPaymentRequest>(endpoint);
}

/**
 * Verify a crypto payment by transaction hash
 */
export async function verifyCryptoPayment(
  paymentId: string,
  dto: VerifyCryptoPaymentDto
): Promise<CryptoPaymentRequest> {
  console.log("🔍 Verifying crypto payment:", {
    paymentId,
    transactionHash: dto.transactionHash,
  });
  const endpoint = `payments/crypto/${paymentId}/verify`;
  return apiHelper.post<CryptoPaymentRequest>(endpoint, dto);
}

/**
 * Get current exchange rates for all supported cryptocurrencies
 */
export async function getCryptoExchangeRates(): Promise<CryptoExchangeRate[]> {
  const endpoint = `payments/crypto/rates`;
  return apiHelper.get<CryptoExchangeRate[]>(endpoint);
}

/**
 * Get available networks from backend
 */
export async function getAvailableNetworks(): Promise<any[]> {
  const endpoint = `payments/crypto/networks`;
  return apiHelper.get<any[]>(endpoint);
}

/**
 * Get available currencies from backend
 */
export async function getAvailableCurrencies(): Promise<any[]> {
  const endpoint = `payments/crypto/currencies`;
  return apiHelper.get<any[]>(endpoint);
}

/**
 * Get supported currency-network combinations from backend
 */
export async function getSupportedCombinations(): Promise<any> {
  const endpoint = `payments/crypto/supported-combinations`;
  return apiHelper.get<any>(endpoint);
}

/**
 * Get exchange rate for a specific cryptocurrency
 */
export async function getCryptoExchangeRate(
  currency: CryptoCurrency
): Promise<CryptoExchangeRate> {
  const endpoint = `payments/crypto/rates/${currency}`;
  return apiHelper.get<CryptoExchangeRate>(endpoint);
}

/**
 * Get platform wallet info for receiving payments
 */
export async function getWalletInfo(
  currency: CryptoCurrency,
  network: CryptoNetwork
): Promise<CryptoWalletInfo> {
  const endpoint = `payments/crypto/wallet/${currency}/${network}`;
  return apiHelper.get<CryptoWalletInfo>(endpoint);
}

/**
 * Get user's crypto payment history
 */
export async function getCryptoPaymentHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<CryptoPaymentHistory> {
  const endpoint = `payments/crypto/history?page=${page}&pageSize=${pageSize}`;
  return apiHelper.get<CryptoPaymentHistory>(endpoint);
}

/**
 * Cancel a pending crypto payment
 */
export async function cancelCryptoPayment(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  const endpoint = `payments/crypto/${paymentId}/cancel`;
  return apiHelper.post<CryptoPaymentRequest>(endpoint, {});
}

/**
 * Get user's saved crypto wallets
 */
export async function getSavedCryptoWallets(): Promise<CryptoPaymentMethod[]> {
  const endpoint = `payments/crypto/wallets`;
  return apiHelper.get<CryptoPaymentMethod[]>(endpoint);
}

/**
 * Save a crypto wallet for future use
 */
export async function saveCryptoWallet(
  dto: SaveCryptoWalletDto
): Promise<CryptoPaymentMethod> {
  const endpoint = `payments/crypto/wallets`;
  return apiHelper.post<CryptoPaymentMethod>(endpoint, dto);
}

/**
 * Remove a saved crypto wallet
 */
export async function removeCryptoWallet(walletId: string): Promise<void> {
  const endpoint = `payments/crypto/wallets/${walletId}`;
  return apiHelper.delete<void>(endpoint);
}

/**
 * Set a crypto wallet as default
 */
export async function setDefaultCryptoWallet(
  walletId: string
): Promise<CryptoPaymentMethod> {
  const endpoint = `payments/crypto/wallets/${walletId}/default`;
  return apiHelper.patch<CryptoPaymentMethod>(endpoint, {});
}

/**
 * Poll for payment status updates
 * Returns updated payment request
 * Legacy method - use checkPaymentStatus for automatic detection
 */
export async function pollPaymentStatus(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  return getCryptoPayment(paymentId);
}

/**
 * Check payment status with explicit endpoint
 * Uses the new POST /check-status endpoint
 * Forces immediate blockchain verification and automatic transaction detection
 * This is the PRIMARY method for payment status checking
 */
export async function checkPaymentStatus(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  console.log("🔄 Checking payment status:", paymentId);
  const endpoint = `payments/crypto/${paymentId}/check-status`;
  const result = await apiHelper.post<CryptoPaymentRequest>(endpoint, {});
  console.log("📊 Payment status result:", {
    status: result.status,
    confirmations: result.confirmations,
    requiredConfirmations: result.requiredConfirmations,
    transactionHash: result.transactionHash,
  });
  return result;
}

/**
 * Get recommended polling interval based on payment status
 * Optimized intervals for automatic detection
 */
export function getPollingInterval(status: string): number {
  const POLLING_INTERVALS = {
    pending: 10000, // 10 seconds - waiting for transaction detection
    confirming: 15000, // 15 seconds - waiting for confirmations
    confirmed: 5000, // 5 seconds - final check before completion
    completed: 0, // Stop polling
    expired: 0, // Stop polling
    cancelled: 0, // Stop polling
    failed: 0, // Stop polling
  };

  return POLLING_INTERVALS[status as keyof typeof POLLING_INTERVALS] || 0;
}

// ========== Client-side Utilities ==========

/**
 * @deprecated This function is deprecated as of HD wallet integration.
 * Each payment request now receives a UNIQUE HD-derived address from the backend.
 * Always use the walletAddress from the payment response (createCryptoPayment).
 *
 * Get platform wallet addresses for receiving crypto payments
 * @returns Empty object - addresses are now dynamically generated per payment
 */
export function getPlatformWalletAddresses(): Record<
  string,
  Record<CryptoNetwork, string>
> {
  console.warn(
    "⚠️ getPlatformWalletAddresses is deprecated. Use payment.walletAddress from API response."
  );
  return {};
}

/**
 * @deprecated This function is deprecated as of HD wallet integration.
 * Each payment request now receives a UNIQUE HD-derived address from the backend.
 * Always use the walletAddress from the payment response (createCryptoPayment).
 *
 * Get wallet address for a specific currency and network
 * @returns null - addresses are now dynamically generated per payment
 */
export function getWalletAddressForNetwork(
  currency: CryptoCurrency,
  network: CryptoNetwork
): string | null {
  console.warn(
    "⚠️ getWalletAddressForNetwork is deprecated. Use payment.walletAddress from API response."
  );
  return null;
}

/**
 * Get information about supported cryptocurrencies - Updated v2.0
 * Supported networks: Ethereum, Solana, Polygon, Base, Stellar
 * Supported currencies: USDC, EURC
 */
export function getSupportedCryptocurrencies(): CryptoCurrencyInfo[] {
  return [
    {
      code: "USDC",
      name: "USD Coin (USDC)",
      symbol: "$",
      iconName: "usdc",
      networks: ["ethereum", "solana", "polygon", "base", "stellar"],
      minAmount: 1,
      confirmationsRequired: 12,
      estimatedTime: "~30 sec - 5 min",
      decimals: {
        ethereum: 6,
        solana: 6,
        polygon: 6,
        base: 6,
        stellar: 7,
      },
    },
    {
      code: "EURC",
      name: "Euro Coin (EURC)",
      symbol: "€",
      iconName: "eurc",
      networks: ["ethereum", "solana", "polygon", "base", "stellar"],
      minAmount: 1,
      confirmationsRequired: 12,
      estimatedTime: "~30 sec - 5 min",
      decimals: {
        ethereum: 6,
        solana: 6,
        polygon: 6,
        base: 6,
        stellar: 7,
      },
    },
  ];
}

/**
 * Get network display name - Updated v2.0
 */
export function getNetworkName(network: CryptoNetwork): string {
  const networks: Record<CryptoNetwork, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
    polygon: "Polygon",
    base: "Base",
    stellar: "Stellar",
  };
  return networks[network];
}

/**
 * Format crypto amount with proper decimals - Updated v2.0
 */
export function formatCryptoAmount(
  amount: number,
  currency: CryptoCurrency
): string {
  const decimals: Record<CryptoCurrency, number> = {
    USDC: 6,
    EURC: 6,
  };

  return amount.toFixed(decimals[currency]);
}

/**
 * Generate payment URI for QR code scanning - Updated v2.0
 * Backend generates proper URIs, this is a fallback
 */
export function generatePaymentUri(
  currency: CryptoCurrency,
  address: string,
  amount: number,
  network?: CryptoNetwork,
  label?: string
): string {
  // Backend should generate proper URIs, this is a fallback
  // For USDC/EURC, the URI format depends on the network
  if (network === "solana") {
    return `solana:${address}?amount=${amount}${
      label ? `&label=${encodeURIComponent(label)}` : ""
    }`;
  } else if (network === "stellar") {
    return `web+stellar:pay?destination=${address}&amount=${amount}${
      label ? `&memo=${encodeURIComponent(label)}` : ""
    }`;
  } else {
    // Ethereum, Polygon, Base use EVM-compatible format
    return `ethereum:${address}?value=${amount}${
      label ? `&label=${encodeURIComponent(label)}` : ""
    }`;
  }
}

/**
 * Calculate crypto amount from USD
 */
export function calculateCryptoAmount(
  usdAmount: number,
  exchangeRate: number
): number {
  return usdAmount / exchangeRate;
}

/**
 * Calculate USD amount from crypto
 */
export function calculateUsdAmount(
  cryptoAmount: number,
  exchangeRate: number
): number {
  return cryptoAmount * exchangeRate;
}

/**
 * Validate wallet address format - Updated v2.0
 */
export function validateWalletAddress(
  address: string,
  currency: CryptoCurrency,
  network?: CryptoNetwork
): boolean {
  if (!address || address.trim().length === 0) return false;

  // Validate based on network
  if (network) {
    switch (network) {
      case "ethereum":
      case "polygon":
      case "base":
        // EVM-compatible addresses (0x + 40 hex chars)
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case "solana":
        // Solana addresses are base58 encoded, 32-44 characters
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      case "stellar":
        // Stellar addresses start with G and are 56 characters
        return /^G[A-Z2-7]{55}$/.test(address);
    }
  }

  // Fallback: accept any reasonable length address
  return address.length >= 26 && address.length <= 100;
}

/**
 * Get estimated transaction fee in USD - Updated v2.0
 */
export function getEstimatedFee(
  currency: CryptoCurrency,
  network: CryptoNetwork
): number {
  // Fee estimates for supported networks
  const fees: Record<string, number> = {
    "USDC-ethereum": 3.0, // Ethereum - higher fees
    "USDC-solana": 0.00025, // Solana - very low fees
    "USDC-polygon": 0.01, // Polygon - low fees
    "USDC-base": 0.05, // Base - low fees
    "USDC-stellar": 0.00001, // Stellar - minimal fees
    "EURC-ethereum": 3.0, // Ethereum - higher fees
    "EURC-solana": 0.00025, // Solana - very low fees
    "EURC-polygon": 0.01, // Polygon - low fees
    "EURC-base": 0.05, // Base - low fees
    "EURC-stellar": 0.00001, // Stellar - minimal fees
  };

  const key = `${currency}-${network}`;
  return fees[key] || 1.0;
}

/**
 * Format time remaining for payment expiration
 */
export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime();
  let expiry = new Date(expiresAt).getTime();

  // Check if the expiry seems wrong (less than 1 minute from now)
  // This might happen if backend sends wrong format
  let remaining = expiry - now;

  // Debug logging
  console.log("⏰ Time calculation (raw):", {
    expiresAt,
    expiresAtType: typeof expiresAt,
    now: new Date(now).toISOString(),
    expiry: new Date(expiry).toISOString(),
    remaining: remaining,
    remainingMinutes: Math.floor(remaining / 60000),
  });

  // If expiry is in the past or very soon (< 1 minute), assume backend sent wrong format
  // Common issue: backend might send duration in seconds instead of timestamp
  if (remaining < 60000 && remaining > 0) {
    console.warn(
      "⚠️ Payment expires in less than 1 minute. Possible backend timestamp issue."
    );
    console.warn("⚠️ Attempting to parse as duration in seconds...");

    // Try parsing as seconds duration
    const durationSeconds = parseInt(expiresAt);
    if (!isNaN(durationSeconds) && durationSeconds > 60) {
      // Looks like it might be a duration in seconds
      expiry = now + durationSeconds * 1000;
      remaining = expiry - now;
      console.log("✅ Adjusted expiry:", {
        newExpiry: new Date(expiry).toISOString(),
        newRemainingMinutes: Math.floor(remaining / 60000),
      });
    }
  }

  if (remaining <= 0) return "Expired";

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get status color for UI
 */
export function getPaymentStatusColor(
  status: CryptoPaymentRequest["status"]
): string {
  const colors: Record<CryptoPaymentRequest["status"], string> = {
    pending: "#FFA500",
    confirming: "#1E90FF",
    confirmed: "#32CD32",
    completed: "#28a745",
    expired: "#DC143C",
    cancelled: "#6c757d",
    failed: "#FF0000",
  };
  return colors[status];
}

/**
 * Get status icon for UI
 */
export function getPaymentStatusIcon(
  status: CryptoPaymentRequest["status"]
): string {
  const icons: Record<CryptoPaymentRequest["status"], string> = {
    pending: "clock",
    confirming: "spinner",
    confirmed: "check-circle",
    completed: "check-double",
    expired: "clock-rotate-left",
    cancelled: "ban",
    failed: "circle-xmark",
  };
  return icons[status];
}
