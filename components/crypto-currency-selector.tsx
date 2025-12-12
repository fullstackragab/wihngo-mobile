/**
 * Crypto Currency Selector Component
 * Allows users to select a cryptocurrency for payment
 */

import {
  getCurrenciesForNetwork,
  useCryptoConfig,
} from "@/hooks/useCryptoConfig";
import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  ActivityIndicator,
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
    USDC: require("@/assets/icons/usdc.png"),
    EURC: require("@/assets/icons/eurc.png"),
  };
  return icons[code];
};

export default function CryptoCurrencySelector({
  selectedCurrency,
  onSelect,
  disabled = false,
  network,
}: CryptoCurrencySelectorProps) {
  const { currencies, combinations, loading, error } = useCryptoConfig();

  // Filter currencies based on selected network
  const availableCurrencies = network
    ? currencies.filter((crypto) =>
        getCurrenciesForNetwork(network, combinations).includes(crypto.code)
      )
    : currencies;

  // Debug logging
  console.log("🔍 CryptoCurrencySelector Debug:", {
    network,
    allCurrencies: currencies.map((c) => c.code),
    availableCurrencies: availableCurrencies.map((c) => c.code),
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading currencies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome6 name="circle-exclamation" size={48} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  const renderCurrencyCard = (crypto: (typeof currencies)[0]) => {
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
          <Text style={styles.estimatedTime}>
            {crypto.networks.length} network
            {crypto.networks.length > 1 ? "s" : ""}
          </Text>
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
        {availableCurrencies.length > 0 ? (
          availableCurrencies.map(renderCurrencyCard)
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc3545",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
