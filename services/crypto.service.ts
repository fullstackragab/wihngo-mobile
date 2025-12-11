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
 * Get information about supported cryptocurrencies
 */
export function getSupportedCryptocurrencies(): CryptoCurrencyInfo[] {
  return [
    {
      code: "USDT",
      name: "Tether (USDT)",
      symbol: "₮",
      iconName: "dollar-sign",
      networks: ["tron", "ethereum", "binance-smart-chain"],
      minAmount: 5, // Backend enforces $5 minimum
      confirmationsRequired: 19, // TRON uses 19 confirmations
      estimatedTime: "1-5 minutes", // TRON: 1-2 min, Ethereum: 2-5 min, BSC: 1-3 min
      decimals: {
        tron: 6, // TRC-20 USDT uses 6 decimals
        ethereum: 6, // ERC-20 USDT uses 6 decimals
        "binance-smart-chain": 18, // BEP-20 USDT uses 18 decimals! (Important!)
        bitcoin: 6,
        polygon: 6,
        solana: 6,
        sepolia: 6, // Testnet USDT (if supported)
      },
    },
    {
      code: "ETH",
      name: "Ethereum (ETH)",
      symbol: "Ξ",
      iconName: "ethereum",
      networks: ["ethereum", "sepolia"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "2-5 minutes",
      decimals: {
        tron: 18,
        ethereum: 18, // Native ETH uses 18 decimals
        "binance-smart-chain": 18,
        bitcoin: 18,
        polygon: 18,
        solana: 18,
        sepolia: 18, // Sepolia testnet ETH uses 18 decimals
      },
    },
    {
      code: "USDC",
      name: "USD Coin (USDC)",
      symbol: "$",
      iconName: "dollar-sign",
      networks: ["ethereum", "binance-smart-chain", "polygon"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "2-5 minutes",
      decimals: {
        tron: 6,
        ethereum: 6,
        "binance-smart-chain": 18,
        bitcoin: 6,
        polygon: 6,
        solana: 6,
        sepolia: 6, // Testnet USDC (if supported)
      },
    },
  ];
}

/**
 * Get network display name
 */
export function getNetworkName(network: CryptoNetwork): string {
  const networks: Record<CryptoNetwork, string> = {
    bitcoin: "Bitcoin Network",
    ethereum: "Ethereum (ERC-20)",
    "binance-smart-chain": "Binance Smart Chain (BEP-20)",
    solana: "Solana",
    polygon: "Polygon",
    tron: "Tron (TRC-20)",
    sepolia: "Sepolia Testnet (ETH)",
  };
  return networks[network];
}

/**
 * Format crypto amount with proper decimals
 */
export function formatCryptoAmount(
  amount: number,
  currency: CryptoCurrency
): string {
  const decimals: Record<CryptoCurrency, number> = {
    BTC: 8,
    ETH: 8, // 8 decimals for ETH (including Sepolia testnet)
    USDT: 6, // 6 decimals for most USDT (TRC-20, ERC-20; BEP-20 is 18 but displayed as 6)
    USDC: 6,
    BNB: 4,
    SOL: 4,
    DOGE: 2,
  };

  return amount.toFixed(decimals[currency]);
}

/**
 * Generate payment URI for QR code scanning
 * Note: For USDT, this needs to be network-aware on the backend.
 * TRON uses a different URI format than Ethereum.
 */
export function generatePaymentUri(
  currency: CryptoCurrency,
  address: string,
  amount: number,
  label?: string
): string {
  const formattedAmount = formatCryptoAmount(amount, currency);

  switch (currency) {
    case "BTC":
    case "DOGE":
      return `${currency.toLowerCase()}:${address}?amount=${formattedAmount}${
        label ? `&label=${encodeURIComponent(label)}` : ""
      }`;
    case "ETH":
    case "BNB":
      return `ethereum:${address}?value=${amount * 1e18}${
        label ? `&label=${encodeURIComponent(label)}` : ""
      }`;
    case "USDT":
    case "USDC":
      // For multi-network tokens, the backend should generate the proper URI
      // based on the selected network (Ethereum, TRON, BSC, etc.)
      // This is a fallback for Ethereum network
      return `ethereum:${address}?value=${amount * 1e18}${
        label ? `&label=${encodeURIComponent(label)}` : ""
      }`;
    case "SOL":
      return `solana:${address}?amount=${formattedAmount}${
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
 * Validate wallet address format (basic validation)
 * For currencies that support multiple networks (USDT, USDC),
 * you should also pass the network parameter for accurate validation
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
      case "polygon":
      case "binance-smart-chain":
      case "sepolia": // Sepolia uses same format as Ethereum (EVM-compatible)
        // EVM-compatible addresses (0x + 40 hex chars)
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case "bitcoin":
        // Bitcoin addresses (legacy, SegWit, native SegWit)
        return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
      case "solana":
        // Solana addresses (base58, 32-44 chars)
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }
  }

  // Fallback to currency-based validation
  switch (currency) {
    case "BTC":
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    case "ETH":
    case "BNB":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "USDT":
    case "USDC":
      // For USDT/USDC, check if it matches any supported format
      return (
        /^0x[a-fA-F0-9]{40}$/.test(address) || // EVM (Ethereum, BSC, Polygon, Sepolia)
        /^T[a-zA-Z0-9]{33}$/.test(address) // TRON
      );
    case "SOL":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case "DOGE":
      return /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(address);
    default:
      return false;
  }
}

/**
 * Get estimated transaction fee in USD
 */
export function getEstimatedFee(
  currency: CryptoCurrency,
  network: CryptoNetwork
): number {
  // These are rough estimates and should be fetched from the API in production
  const fees: Record<string, number> = {
    "BTC-bitcoin": 2.5,
    "ETH-ethereum": 5.0,
    "ETH-sepolia": 0.0, // Testnet - no real cost
    "USDT-ethereum": 5.0,
    "USDT-tron": 1.0,
    "USDT-binance-smart-chain": 0.5,
    "USDT-sepolia": 0.0, // Testnet
    "USDC-ethereum": 5.0,
    "USDC-polygon": 0.1,
    "USDC-binance-smart-chain": 0.5,
    "USDC-sepolia": 0.0, // Testnet
    "BNB-binance-smart-chain": 0.3,
    "SOL-solana": 0.01,
    "DOGE-bitcoin": 0.5,
  };

  return fees[`${currency}-${network}`] || 1.0;
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
