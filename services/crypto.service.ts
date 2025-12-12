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
 * Breaking Change: Removed BTC, SOL, MATIC, Sepolia support
 * Network-specific currencies:
 * - Tron: USDT, USDC
 * - Ethereum: ETH, USDT, USDC
 * - Binance Smart Chain: BNB, USDT, USDC
 */
export function getSupportedCryptocurrencies(): CryptoCurrencyInfo[] {
  return [
    {
      code: "USDT",
      name: "Tether (USDT)",
      symbol: "₮",
      iconName: "dollar-sign",
      networks: ["tron", "ethereum", "binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 19,
      estimatedTime: "~1 min", // TRON is fastest
      decimals: {
        tron: 6, // TRC-20 USDT uses 6 decimals
        ethereum: 6, // ERC-20 USDT uses 6 decimals
        "binance-smart-chain": 18, // BEP-20 USDT uses 18 decimals
      },
    },
    {
      code: "USDC",
      name: "USD Coin (USDC)",
      symbol: "$",
      iconName: "dollar-sign",
      networks: ["tron", "ethereum", "binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "~3 min",
      decimals: {
        tron: 6,
        ethereum: 6,
        "binance-smart-chain": 18,
      },
    },
    {
      code: "ETH",
      name: "Ethereum (ETH)",
      symbol: "Ξ",
      iconName: "ethereum",
      networks: ["ethereum"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "~3 min",
      decimals: {
        tron: 18,
        ethereum: 18, // Native ETH uses 18 decimals
        "binance-smart-chain": 18,
      },
    },
    {
      code: "BNB",
      name: "Binance Coin (BNB)",
      symbol: "BNB",
      iconName: "b",
      networks: ["binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 15,
      estimatedTime: "~1 min",
      decimals: {
        tron: 18,
        ethereum: 18,
        "binance-smart-chain": 18,
      },
    },
  ];
}

/**
 * Get network display name - Updated v2.0
 */
export function getNetworkName(network: CryptoNetwork): string {
  const networks: Record<CryptoNetwork, string> = {
    ethereum: "Ethereum (ERC-20)",
    "binance-smart-chain": "Binance Smart Chain (BEP-20)",
    tron: "Tron (TRC-20)",
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
    ETH: 8,
    USDT: 6,
    USDC: 6,
    BNB: 4,
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
  label?: string
): string {
  switch (currency) {
    case "ETH":
    case "BNB":
      return `ethereum:${address}?value=${amount * 1e18}${
        label ? `&label=${encodeURIComponent(label)}` : ""
      }`;
    case "USDT":
    case "USDC":
      // Backend generates proper URI based on network
      // This is a fallback for Ethereum network
      return `ethereum:${address}?value=${amount * 1e18}${
        label ? `&label=${encodeURIComponent(label)}` : ""
      }`;
    default:
      return address;
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

  // For currencies with multiple networks, validate based on network
  if (network) {
    switch (network) {
      case "tron":
        // TRON addresses start with 'T' and are 34 characters
        return /^T[a-zA-Z0-9]{33}$/.test(address);
      case "ethereum":
      case "binance-smart-chain":
        // EVM-compatible addresses (0x + 40 hex chars)
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  }

  // Fallback to currency-based validation
  switch (currency) {
    case "ETH":
    case "BNB":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "USDT":
    case "USDC":
      // For USDT/USDC, check if it matches any supported format
      return (
        /^0x[a-fA-F0-9]{40}$/.test(address) || // EVM (Ethereum, BSC)
        /^T[a-zA-Z0-9]{33}$/.test(address) // TRON
      );
    default:
      return false;
  }
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
    "USDT-tron": 0.01, // TRON - cheapest, recommended
    "USDT-binance-smart-chain": 0.05, // BSC - low fee
    "USDT-ethereum": 5.0, // Ethereum - higher fees
    "USDC-binance-smart-chain": 0.05, // BSC - low fee
    "USDC-ethereum": 5.0, // Ethereum - higher fees
    "ETH-ethereum": 5.0, // Native ETH
    "BNB-binance-smart-chain": 0.05, // Native BNB
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
