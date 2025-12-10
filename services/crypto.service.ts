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
import Constants from "expo-constants";
import { apiHelper } from "./api-helper";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

/**
 * Create a new crypto payment request
 */
export async function createCryptoPayment(
  dto: CreateCryptoPaymentDto
): Promise<CryptoPaymentResponse> {
  const endpoint = `${API_URL}payments/crypto/create`;
  return apiHelper.post<CryptoPaymentResponse>(endpoint, dto);
}

/**
 * Get crypto payment request by ID
 */
export async function getCryptoPayment(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  const endpoint = `${API_URL}payments/crypto/${paymentId}`;
  return apiHelper.get<CryptoPaymentRequest>(endpoint);
}

/**
 * Verify a crypto payment by transaction hash
 */
export async function verifyCryptoPayment(
  paymentId: string,
  dto: VerifyCryptoPaymentDto
): Promise<CryptoPaymentRequest> {
  const endpoint = `${API_URL}payments/crypto/${paymentId}/verify`;
  return apiHelper.post<CryptoPaymentRequest>(endpoint, dto);
}

/**
 * Get current exchange rates for all supported cryptocurrencies
 */
export async function getCryptoExchangeRates(): Promise<CryptoExchangeRate[]> {
  const endpoint = `${API_URL}payments/crypto/rates`;
  return apiHelper.get<CryptoExchangeRate[]>(endpoint);
}

/**
 * Get exchange rate for a specific cryptocurrency
 */
export async function getCryptoExchangeRate(
  currency: CryptoCurrency
): Promise<CryptoExchangeRate> {
  const endpoint = `${API_URL}payments/crypto/rates/${currency}`;
  return apiHelper.get<CryptoExchangeRate>(endpoint);
}

/**
 * Get platform wallet info for receiving payments
 */
export async function getWalletInfo(
  currency: CryptoCurrency,
  network: CryptoNetwork
): Promise<CryptoWalletInfo> {
  const endpoint = `${API_URL}payments/crypto/wallet/${currency}/${network}`;
  return apiHelper.get<CryptoWalletInfo>(endpoint);
}

/**
 * Get user's crypto payment history
 */
export async function getCryptoPaymentHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<CryptoPaymentHistory> {
  const endpoint = `${API_URL}payments/crypto/history?page=${page}&pageSize=${pageSize}`;
  return apiHelper.get<CryptoPaymentHistory>(endpoint);
}

/**
 * Cancel a pending crypto payment
 */
export async function cancelCryptoPayment(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  const endpoint = `${API_URL}payments/crypto/${paymentId}/cancel`;
  return apiHelper.post<CryptoPaymentRequest>(endpoint, {});
}

/**
 * Get user's saved crypto wallets
 */
export async function getSavedCryptoWallets(): Promise<CryptoPaymentMethod[]> {
  const endpoint = `${API_URL}payments/crypto/wallets`;
  return apiHelper.get<CryptoPaymentMethod[]>(endpoint);
}

/**
 * Save a crypto wallet for future use
 */
export async function saveCryptoWallet(
  dto: SaveCryptoWalletDto
): Promise<CryptoPaymentMethod> {
  const endpoint = `${API_URL}payments/crypto/wallets`;
  return apiHelper.post<CryptoPaymentMethod>(endpoint, dto);
}

/**
 * Remove a saved crypto wallet
 */
export async function removeCryptoWallet(walletId: string): Promise<void> {
  const endpoint = `${API_URL}payments/crypto/wallets/${walletId}`;
  return apiHelper.delete<void>(endpoint);
}

/**
 * Set a crypto wallet as default
 */
export async function setDefaultCryptoWallet(
  walletId: string
): Promise<CryptoPaymentMethod> {
  const endpoint = `${API_URL}payments/crypto/wallets/${walletId}/default`;
  return apiHelper.patch<CryptoPaymentMethod>(endpoint, {});
}

/**
 * Poll for payment status updates
 * Returns updated payment request
 */
export async function pollPaymentStatus(
  paymentId: string
): Promise<CryptoPaymentRequest> {
  return getCryptoPayment(paymentId);
}

// ========== Client-side Utilities ==========

/**
 * Get information about supported cryptocurrencies
 */
export function getSupportedCryptocurrencies(): CryptoCurrencyInfo[] {
  return [
    {
      code: "BTC",
      name: "Bitcoin",
      symbol: "₿",
      iconName: "bitcoin",
      networks: ["bitcoin"],
      minAmount: 10,
      confirmationsRequired: 2,
      estimatedTime: "10-30 minutes",
    },
    {
      code: "ETH",
      name: "Ethereum",
      symbol: "Ξ",
      iconName: "ethereum",
      networks: ["ethereum"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "2-5 minutes",
    },
    {
      code: "USDT",
      name: "Tether",
      symbol: "₮",
      iconName: "dollar-sign",
      networks: ["ethereum", "tron", "binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 12, // Note: TRON uses 19 confirmations but is faster (~57 seconds)
      estimatedTime: "1-5 minutes", // TRON: 1-2 min, Ethereum: 2-5 min, BSC: 1-3 min
    },
    {
      code: "USDC",
      name: "USD Coin",
      symbol: "$",
      iconName: "dollar-sign",
      networks: ["ethereum", "polygon", "binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 12,
      estimatedTime: "2-5 minutes",
    },
    {
      code: "BNB",
      name: "Binance Coin",
      symbol: "BNB",
      iconName: "coins",
      networks: ["binance-smart-chain"],
      minAmount: 5,
      confirmationsRequired: 15,
      estimatedTime: "1-2 minutes",
    },
    {
      code: "SOL",
      name: "Solana",
      symbol: "◎",
      iconName: "circle-dot",
      networks: ["solana"],
      minAmount: 5,
      confirmationsRequired: 32,
      estimatedTime: "30-60 seconds",
    },
    {
      code: "DOGE",
      name: "Dogecoin",
      symbol: "Ð",
      iconName: "dog",
      networks: ["bitcoin"],
      minAmount: 10,
      confirmationsRequired: 6,
      estimatedTime: "5-15 minutes",
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
    ETH: 6,
    USDT: 2,
    USDC: 2,
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
        /^0x[a-fA-F0-9]{40}$/.test(address) || // EVM (Ethereum, BSC, Polygon)
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
    "USDT-ethereum": 5.0,
    "USDT-tron": 1.0,
    "USDT-binance-smart-chain": 0.5,
    "USDC-ethereum": 5.0,
    "USDC-polygon": 0.1,
    "USDC-binance-smart-chain": 0.5,
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
  const expiry = new Date(expiresAt).getTime();
  const remaining = expiry - now;

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
    failed: "#FF0000",
    refunded: "#9370DB",
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
    failed: "circle-xmark",
    refunded: "arrow-rotate-left",
  };
  return icons[status];
}
