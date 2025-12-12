/**
 * Hook to fetch and manage crypto configuration from backend
 */

import { NETWORK_OPTIONS } from "@/config/paymentMethods";
import {
  getAvailableCurrencies,
  getAvailableNetworks,
  getSupportedCombinations,
  getSupportedCryptocurrencies,
} from "@/services/crypto.service";
import {
  CryptoCurrency,
  CryptoNetwork,
  VALID_COMBINATIONS,
} from "@/types/crypto";
import { useEffect, useState } from "react";

interface NetworkConfig {
  network: CryptoNetwork;
  name: string;
  description: string;
  estimatedFee: string;
  estimatedTime: string;
  confirmations: number;
  badge?: string;
  badgeColor?: string;
  supportedCurrencies: CryptoCurrency[];
}

interface CurrencyConfig {
  code: CryptoCurrency;
  name: string;
  symbol: string;
  networks: CryptoNetwork[];
  minAmount: number;
  decimals: Record<CryptoNetwork, number>;
}

interface CryptoConfig {
  networks: NetworkConfig[];
  currencies: CurrencyConfig[];
  combinations: Record<CryptoCurrency, CryptoNetwork[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCryptoConfig(): CryptoConfig {
  const [networks, setNetworks] = useState<NetworkConfig[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([]);
  const [combinations, setCombinations] = useState<
    Record<CryptoCurrency, CryptoNetwork[]>
  >({} as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const [networksData, currenciesData, combinationsData] =
        await Promise.all([
          getAvailableNetworks().catch(() => {
            // Fallback to local config if API fails
            console.log("⚠️ Using fallback network configuration");
            return NETWORK_OPTIONS;
          }),
          getAvailableCurrencies().catch(() => {
            // Fallback to local config if API fails
            console.log("⚠️ Using fallback currency configuration");
            return getSupportedCryptocurrencies();
          }),
          getSupportedCombinations().catch(() => {
            // Fallback to local config if API fails
            console.log("⚠️ Using fallback combinations configuration");
            return VALID_COMBINATIONS;
          }),
        ]);

      setNetworks(networksData);
      setCurrencies(currenciesData);
      setCombinations(combinationsData);
    } catch (err) {
      console.error("Failed to fetch crypto configuration:", err);
      // Use local fallback data
      console.log("⚠️ Using complete fallback configuration");
      setNetworks(NETWORK_OPTIONS);
      setCurrencies(getSupportedCryptocurrencies());
      setCombinations(VALID_COMBINATIONS);
      setError(null); // Don't show error when we have fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    networks,
    currencies,
    combinations,
    loading,
    error,
    refetch: fetchConfig,
  };
}

/**
 * Get currencies available for a specific network
 */
export function getCurrenciesForNetwork(
  network: CryptoNetwork,
  combinations: Record<CryptoCurrency, CryptoNetwork[]>
): CryptoCurrency[] {
  const currencies: CryptoCurrency[] = [];

  Object.entries(combinations).forEach(([currency, networks]) => {
    if (networks.includes(network)) {
      currencies.push(currency as CryptoCurrency);
    }
  });

  return currencies;
}

/**
 * Get networks available for a specific currency
 */
export function getNetworksForCurrency(
  currency: CryptoCurrency,
  combinations: Record<CryptoCurrency, CryptoNetwork[]>
): CryptoNetwork[] {
  return combinations[currency] || [];
}
