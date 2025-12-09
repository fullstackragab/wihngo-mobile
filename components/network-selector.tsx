/**
 * Network Selector Component
 * Allows users to select blockchain network for a cryptocurrency
 */

import { getEstimatedFee, getNetworkName } from "@/services/crypto.service";
import { CryptoNetwork } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NetworkSelectorProps = {
  networks: CryptoNetwork[];
  selectedNetwork?: CryptoNetwork;
  onSelect: (network: CryptoNetwork) => void;
  currency: string;
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Network</Text>
      <View style={styles.networkList}>
        {networks.map((network) => {
          const isSelected = selectedNetwork === network;
          const fee = getEstimatedFee(currency as any, network);

          return (
            <TouchableOpacity
              key={network}
              style={[
                styles.networkCard,
                isSelected && styles.selectedCard,
                disabled && styles.disabledCard,
              ]}
              onPress={() => !disabled && onSelect(network)}
              disabled={disabled}
            >
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>
                  {getNetworkName(network)}
                </Text>
                <Text style={styles.networkFee}>Fee: ~${fee.toFixed(2)}</Text>
              </View>
              {isSelected && (
                <FontAwesome6 name="circle-check" size={20} color="#007AFF" />
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
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  networkList: {
    gap: 8,
  },
  networkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
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
  networkInfo: {
    gap: 4,
  },
  networkName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  networkFee: {
    fontSize: 12,
    color: "#666",
  },
});
