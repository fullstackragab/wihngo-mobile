/**
 * Network Selector Component
 * Allows users to select blockchain network for a cryptocurrency
 */

import { getEstimatedFee, getNetworkName } from "@/services/crypto.service";
import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NetworkSelectorProps = {
  networks: CryptoNetwork[];
  selectedNetwork?: CryptoNetwork;
  onSelect: (network: CryptoNetwork) => void;
  currency: CryptoCurrency;
  disabled?: boolean;
};

export default function NetworkSelector({
  networks,
  selectedNetwork,
  onSelect,
  currency,
  disabled = false,
}: NetworkSelectorProps) {
  if (networks.length <= 1) {
    return null; // No need to show selector if only one network
  }

  // Solana only - network selector won't render with single network
  const getNetworkDetails = (network: CryptoNetwork) => {
    return { speed: "Very Fast (~1 sec)", confirmations: 1 };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Network</Text>
      <Text style={styles.sublabel}>
        Choose the blockchain network to use for your payment
      </Text>
      <View style={styles.networkList}>
        {networks.map((network) => {
          const isSelected = selectedNetwork === network;
          const networkCurrency = getCurrencyForNetwork(network);
          const fee = getEstimatedFee(networkCurrency, network);
          const details = getNetworkDetails(network);
          const isTestnet = network === "sepolia";

          return (
            <TouchableOpacity
              key={network}
              style={[
                styles.networkCard,
                isSelected && styles.selectedCard,
                disabled && styles.disabledCard,
                isTestnet && styles.testnetCard,
              ]}
              onPress={() => !disabled && onSelect(network)}
              disabled={disabled}
            >
              <View style={styles.networkInfo}>
                <View style={styles.networkHeader}>
                  <Text
                    style={[
                      styles.networkName,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {getNetworkName(network)}
                  </Text>
                  {isTestnet && (
                    <View style={styles.testnetBadge}>
                      <Text style={styles.testnetBadgeText}>TESTNET</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.currencyInfo}>Uses {networkCurrency}</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <FontAwesome6
                      name="clock"
                      size={12}
                      color={isSelected ? "#007AFF" : "#666"}
                    />
                    <Text style={styles.networkDetail}>{details.speed}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome6
                      name="dollar-sign"
                      size={12}
                      color={isSelected ? "#007AFF" : "#666"}
                    />
                    <Text style={styles.networkDetail}>
                      Fee: ~${fee.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              {isSelected && (
                <FontAwesome6 name="circle-check" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  networkList: {
    gap: 12,
  },
  networkCard: {
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
  testnetCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  networkInfo: {
    flex: 1,
    gap: 8,
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  testnetBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testnetBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  currencyInfo: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectedText: {
    color: "#007AFF",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  networkDetail: {
    fontSize: 13,
    color: "#666",
  },
});
