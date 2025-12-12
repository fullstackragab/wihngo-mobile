/**
 * Crypto Currency Selector Component
 * Allows users to select a cryptocurrency for payment
 */

import { getSupportedCryptocurrencies } from "@/services/crypto.service";
import {
  CryptoCurrency,
  CryptoCurrencyInfo,
  CryptoNetwork,
  getCurrenciesForNetwork,
} from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CryptoCurrencySelectorProps = {
  selectedCurrency?: CryptoCurrency;
  onSelect: (currency: CryptoCurrency) => void;
  disabled?: boolean;
  network?: CryptoNetwork; // Filter currencies by network
};

// Helper function to get currency icon
const getCurrencyIcon = (code: CryptoCurrency) => {
  const icons: Record<CryptoCurrency, any> = {
    USDT: require("@/assets/icons/tether-usdt-logo.png"),
    USDC: require("@/assets/icons/usd-coin-usdc-logo.png"),
    ETH: require("@/assets/icons/ethereum-eth-logo.png"),
    BNB: require("@/assets/icons/bnb-bnb-logo.png"),
  };
  return icons[code];
};

export default function CryptoCurrencySelector({
  selectedCurrency,
  onSelect,
  disabled = false,
  network,
}: CryptoCurrencySelectorProps) {
  const allCryptocurrencies = getSupportedCryptocurrencies();

  // Filter currencies based on selected network
  const cryptocurrencies = network
    ? allCryptocurrencies.filter((crypto) =>
        getCurrenciesForNetwork(network).includes(crypto.code)
      )
    : allCryptocurrencies;

  // Debug logging
  console.log("🔍 CryptoCurrencySelector Debug:", {
    network,
    allCryptocurrencies: allCryptocurrencies.map((c) => c.code),
    availableCurrencies: network ? getCurrenciesForNetwork(network) : "all",
    filteredCurrencies: cryptocurrencies.map((c) => c.code),
  });

  const renderCurrencyCard = (crypto: CryptoCurrencyInfo) => {
    const isSelected = selectedCurrency === crypto.code;

    return (
      <TouchableOpacity
        key={crypto.code}
        style={[
          styles.currencyCard,
          isSelected && styles.selectedCard,
          disabled && styles.disabledCard,
        ]}
        onPress={() => !disabled && onSelect(crypto.code)}
        disabled={disabled}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.selectedIconContainer,
            ]}
          >
            <Image
              source={getCurrencyIcon(crypto.code)}
              style={styles.currencyIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyName}>{crypto.name}</Text>
            <Text style={styles.currencyCode}>{crypto.code}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.estimatedTime}>{crypto.estimatedTime}</Text>
          {isSelected && (
            <FontAwesome6 name="circle-check" size={20} color="#007AFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Cryptocurrency</Text>
        <Text style={styles.headerSubtitle}>
          Choose your preferred payment method
        </Text>
      </View>

      <View style={styles.currencyList}>
        {cryptocurrencies.length > 0 ? (
          cryptocurrencies.map(renderCurrencyCard)
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome6 name="circle-exclamation" size={48} color="#999" />
            <Text style={styles.emptyStateText}>
              No currencies available for this network
            </Text>
            {network && (
              <Text style={styles.emptyStateSubtext}>Network: {network}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <FontAwesome6 name="circle-info" size={16} color="#007AFF" />
        <Text style={styles.infoText}>
          Estimated confirmation times may vary based on network conditions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  currencyList: {
    gap: 12,
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedIconContainer: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  currencyIcon: {
    width: 36,
    height: 36,
  },
  currencyInfo: {
    gap: 4,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  currencyCode: {
    fontSize: 14,
    color: "#666",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  estimatedTime: {
    fontSize: 12,
    color: "#666",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#007AFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
