/**
 * Payment Method Selector Component
 * Shows all available currencies grouped by network for quick selection
 */

import {
  PaymentMethod,
  getEnabledPaymentMethods,
} from "@/config/paymentMethods";
import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentMethodSelectorProps {
  selectedMethodId?: string;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selectedMethodId,
  onSelect,
}: PaymentMethodSelectorProps) {
  const allMethods = getEnabledPaymentMethods();

  // Group methods by network for organized display - Solana only
  const methodsByNetwork: Record<string, PaymentMethod[]> = {
    solana: [],
  };

  allMethods.forEach((method) => {
    if (methodsByNetwork[method.network]) {
      methodsByNetwork[method.network].push(method);
    }
  });

  const getCurrencyIcon = (currency: CryptoCurrency): string => {
    const icons: Record<CryptoCurrency, string> = {
      USDC: "dollar-sign",
      EURC: "euro-sign",
    };
    return icons[currency] || "coins";
  };

  const getCurrencyColor = (currency: CryptoCurrency): string => {
    const colors: Record<CryptoCurrency, string> = {
      USDC: "#2775CA",
      EURC: "#0052FF",
    };
    return colors[currency] || "#007AFF";
  };

  const getNetworkName = (network: CryptoNetwork): string => {
    const names: Record<CryptoNetwork, string> = {
      solana: "Solana",
    };
    return names[network] || network;
  };

  const renderCurrencyButton = (method: PaymentMethod) => {
    const isSelected = selectedMethodId === method.id;
    const currencyColor = getCurrencyColor(method.currency);
    const icon = getCurrencyIcon(method.currency);

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.currencyButton,
          isSelected && styles.currencyButtonSelected,
          { borderColor: currencyColor },
        ]}
        onPress={() => onSelect(method)}
      >
        <View
          style={[
            styles.currencyIconLarge,
            { backgroundColor: `${currencyColor}15` },
          ]}
        >
          <FontAwesome6 name={icon as any} size={32} color={currencyColor} />
        </View>

        <View style={styles.currencyButtonInfo}>
          <View style={styles.currencyButtonHeader}>
            <Text style={styles.currencyButtonTitle}>{method.currency}</Text>
            {method.badge && (
              <View
                style={[
                  styles.currencyBadge,
                  { backgroundColor: method.badgeColor || "#007AFF" },
                ]}
              >
                <Text style={styles.currencyBadgeText}>{method.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.currencyButtonNetwork}>
            {getNetworkName(method.network)}
          </Text>
          <Text style={styles.currencyButtonDescription}>
            {method.description}
          </Text>

          <View style={styles.currencyButtonDetails}>
            <View style={styles.currencyButtonDetail}>
              <FontAwesome6 name="clock" size={12} color="#666" />
              <Text style={styles.currencyButtonDetailText}>
                {method.estimatedTime}
              </Text>
            </View>
            <View style={styles.currencyButtonDetail}>
              <FontAwesome6 name="dollar-sign" size={12} color="#666" />
              <Text style={styles.currencyButtonDetailText}>
                {method.estimatedFee}
              </Text>
            </View>
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedCheck}>
            <FontAwesome6 name="circle-check" size={24} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Cryptocurrency</Text>
        <Text style={styles.subtitle}>
          Choose your preferred payment method
        </Text>
      </View>

      {/* Network: Solana - Only supported network */}
      {methodsByNetwork.solana.length > 0 && (
        <View style={styles.networkSection}>
          <View style={styles.networkSectionHeader}>
            <FontAwesome6 name="bolt" size={20} color="#14F195" />
            <Text style={styles.networkSectionTitle}>
              {getNetworkName("solana")}
            </Text>
            <View style={[styles.badge, { backgroundColor: "#14F195" }]}>
              <Text style={styles.badgeText}>RECOMMENDED</Text>
            </View>
          </View>
          {methodsByNetwork.solana.map(renderCurrencyButton)}
        </View>
      )}

      <View style={styles.infoBox}>
        <FontAwesome6 name="circle-info" size={16} color="#007AFF" />
        <Text style={styles.infoText}>
          Each payment receives a unique secure address. Network fees are
          estimated and may vary.
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  // Network Section Styles
  networkSection: {
    marginBottom: 24,
  },
  networkSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
  },
  networkSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  // Currency Button Styles
  currencyButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  currencyButtonSelected: {
    backgroundColor: "#f8fffe",
    borderColor: "#4CAF50",
    shadowOpacity: 0.15,
    elevation: 5,
  },
  currencyIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  currencyButtonInfo: {
    flex: 1,
  },
  currencyButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 8,
  },
  currencyButtonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencyBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  currencyButtonNetwork: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  currencyButtonDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  currencyButtonDetails: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  currencyButtonDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencyButtonDetailText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  selectedCheck: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1976D2",
    lineHeight: 20,
  },
});
