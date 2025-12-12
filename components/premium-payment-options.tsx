/**
 * Premium Payment Options Component
 * Displays payment method selection including crypto
 */

import { PremiumPlan } from "@/types/premium";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentOption = "card" | "crypto" | "apple" | "google";

type PremiumPaymentOptionsProps = {
  birdId: string;
  plan: PremiumPlan;
  amount: number;
  onSelectPayment: (method: PaymentOption) => void;
};

export default function PremiumPaymentOptions({
  birdId,
  plan,
  amount,
  onSelectPayment,
}: PremiumPaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentOption>();

  const paymentOptions = [
    {
      id: "card" as PaymentOption,
      name: "Credit/Debit Card",
      icon: "credit-card",
      description: "Pay with Visa, Mastercard, or Amex",
      color: "#007AFF",
      available: true,
    },
    {
      id: "crypto" as PaymentOption,
      name: "Cryptocurrency",
      icon: "bitcoin-sign",
      description: "USDC, EURC on multiple networks",
      color: "#F7931A",
      badge: "NEW",
      available: true,
    },
    {
      id: "apple" as PaymentOption,
      name: "Apple Pay",
      icon: "apple",
      description: "Fast and secure with Face ID",
      color: "#000",
      available: true,
    },
    {
      id: "google" as PaymentOption,
      name: "Google Pay",
      icon: "google",
      description: "Quick checkout with Google",
      color: "#4285F4",
      available: true,
    },
  ];

  const handleSelect = (method: PaymentOption) => {
    setSelectedMethod(method);

    if (method === "crypto") {
      // Navigate to crypto payment screen
      router.push({
        pathname: "/crypto-payment" as any,
        params: {
          birdId,
          plan,
          amount: amount.toString(),
          purpose: "premium_subscription",
        },
      });
    } else {
      onSelectPayment(method);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
        <Text style={styles.headerSubtitle}>
          Choose how you&apos;d like to pay ${amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.optionsList}>
        {paymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedMethod === option.id && styles.selectedCard,
              !option.available && styles.disabledCard,
            ]}
            onPress={() => option.available && handleSelect(option.id)}
            disabled={!option.available}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "20" },
                ]}
              >
                <FontAwesome6
                  name={option.icon as any}
                  size={24}
                  color={option.color}
                />
              </View>
              <View style={styles.optionInfo}>
                <View style={styles.optionNameRow}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  {option.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{option.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
            {selectedMethod === option.id && (
              <FontAwesome6 name="circle-check" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Why use crypto?</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <FontAwesome6 name="bolt" size={16} color="#F7931A" />
            <Text style={styles.benefitText}>Instant confirmation</Text>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome6 name="shield" size={16} color="#F7931A" />
            <Text style={styles.benefitText}>Enhanced privacy</Text>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome6 name="globe" size={16} color="#F7931A" />
            <Text style={styles.benefitText}>Available worldwide</Text>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome6 name="percent" size={16} color="#F7931A" />
            <Text style={styles.benefitText}>Lower fees</Text>
          </View>
        </View>
      </View>

      <View style={styles.securityInfo}>
        <FontAwesome6 name="shield-halved" size={20} color="#28a745" />
        <Text style={styles.securityText}>
          All transactions are secured with industry-standard encryption
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  optionsList: {
    padding: 20,
    gap: 12,
  },
  optionCard: {
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
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  optionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  badge: {
    backgroundColor: "#F7931A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
  },
  benefitsSection: {
    margin: 20,
    padding: 16,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F7931A",
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#28a745",
  },
});
