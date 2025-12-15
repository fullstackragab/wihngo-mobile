import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { PayoutMethodType } from "@/types/payout";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddPayoutMethod() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethodType | null>(
    null
  );

  const payoutMethods = [
    {
      type: "iban" as PayoutMethodType,
      icon: "card-outline",
      title: "IBAN (SEPA)",
      subtitle: "Bank transfer • Best for EU users",
      recommended: true,
      features: [
        "Works in all EU countries",
        "SEPA fee: €0-€1",
        "Processing: 1-3 business days",
        "Requires IBAN + account holder name",
      ],
    },
    {
      type: "paypal" as PayoutMethodType,
      icon: "logo-paypal",
      title: "PayPal",
      subtitle: "Instant transfer • Worldwide",
      recommended: false,
      features: [
        "Available worldwide",
        "Instant transfers",
        "PayPal fee: ~2-3%",
        "Requires verified PayPal account",
      ],
    },
    {
      type: "usdc-solana" as PayoutMethodType,
      icon: "wallet-outline",
      title: "USDC (Solana)",
      subtitle: "Stablecoin • Low fees",
      recommended: false,
      features: [
        "Cryptocurrency (pegged to USD)",
        "Solana network fees: <$0.01",
        "Fast settlement",
        "Requires Solana wallet",
      ],
    },
    {
      type: "eurc-solana" as PayoutMethodType,
      icon: "wallet-outline",
      title: "EURC (Solana)",
      subtitle: "Stablecoin • Low fees",
      recommended: false,
      features: [
        "Cryptocurrency (pegged to EUR)",
        "Solana network fees: <$0.01",
        "Fast settlement",
        "Requires Solana wallet",
      ],
    },
    {
      type: "usdc-base" as PayoutMethodType,
      icon: "wallet-outline",
      title: "USDC (Base)",
      subtitle: "Stablecoin • Layer 2",
      recommended: false,
      features: [
        "Cryptocurrency (pegged to USD)",
        "Base network fees: ~$0.01",
        "Layer 2 Ethereum",
        "Requires Base-compatible wallet",
      ],
    },
    {
      type: "eurc-base" as PayoutMethodType,
      icon: "wallet-outline",
      title: "EURC (Base)",
      subtitle: "Stablecoin • Layer 2",
      recommended: false,
      features: [
        "Cryptocurrency (pegged to EUR)",
        "Base network fees: ~$0.01",
        "Layer 2 Ethereum",
        "Requires Base-compatible wallet",
      ],
    },
  ];

  const handleSelectMethod = (type: PayoutMethodType) => {
    setSelectedMethod(type);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert("Select Method", "Please select a payout method");
      return;
    }

    // Navigate to the specific configuration screen
    switch (selectedMethod) {
      case "iban":
        router.push("/add-iban-method");
        break;
      case "paypal":
        router.push("/add-paypal-method");
        break;
      case "usdc-solana":
      case "eurc-solana":
      case "usdc-base":
      case "eurc-base":
        router.push({
          pathname: "/add-crypto-method",
          params: { methodType: selectedMethod },
        });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Payout Method</Text>
          <Text style={styles.subtitle}>
            Select how you want to receive support from your birds
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
            <Text style={styles.infoText}>
              Wihngo charges a 5% platform fee
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#27AE60" />
            <Text style={styles.infoText}>95% of support belongs to you</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#3498DB" />
            <Text style={styles.infoText}>Payment provider fees may apply</Text>
          </View>
        </View>

        {/* Methods List */}
        <View style={styles.methodsList}>
          {payoutMethods.map((method) => (
            <TouchableOpacity
              key={method.type}
              style={[
                styles.methodCard,
                selectedMethod === method.type && styles.methodCardSelected,
              ]}
              onPress={() => handleSelectMethod(method.type)}
            >
              {method.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}

              <View style={styles.methodHeader}>
                <View style={styles.methodIcon}>
                  <Ionicons
                    name={method.icon as any}
                    size={28}
                    color={
                      selectedMethod === method.type ? "#4ECDC4" : "#2C3E50"
                    }
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
                {selectedMethod === method.type && (
                  <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                )}
              </View>

              <View style={styles.methodFeatures}>
                {method.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color="#27AE60" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Ionicons name="document-text-outline" size={16} color="#7F8C8D" />
          <Text style={styles.legalText}>
            You are responsible for providing correct payout details and
            handling applicable taxes. Wihngo is not a payment institution.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedMethod && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#E8F8F5",
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    flex: 1,
  },
  methodsList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  methodCard: {
    backgroundColor: "#fff",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ECF0F1",
    position: "relative",
  },
  methodCardSelected: {
    borderColor: "#4ECDC4",
    backgroundColor: "#F0FCFB",
  },
  recommendedBadge: {
    position: "absolute",
    top: -8,
    right: Spacing.md,
    backgroundColor: "#F39C12",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: Typography.small,
    color: "#7F8C8D",
  },
  methodFeatures: {
    gap: Spacing.xs,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  featureText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    flex: 1,
  },
  legalNotice: {
    flexDirection: "row",
    gap: Spacing.sm,
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  legalText: {
    fontSize: 11,
    color: "#7F8C8D",
    lineHeight: 16,
    flex: 1,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: Typography.h3,
    fontWeight: "bold",
  },
});
