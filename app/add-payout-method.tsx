import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { PayoutMethodType } from "@/types/payout";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddPayoutMethod() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<{
    type: PayoutMethodType;
    cryptoConfig?: { currency: string; network: string };
  } | null>(null);

  const payoutMethods = [
    {
      type: "BankTransfer" as PayoutMethodType,
      icon: "card-outline",
      title: t("addPayoutMethod.methods.iban.title"),
      subtitle: t("addPayoutMethod.methods.iban.subtitle"),
      recommended: true,
      features: [
        t("addPayoutMethod.methods.iban.feature1"),
        t("addPayoutMethod.methods.iban.feature2"),
        t("addPayoutMethod.methods.iban.feature3"),
        t("addPayoutMethod.methods.iban.feature4"),
      ],
    },
    {
      type: "PayPal" as PayoutMethodType,
      icon: "logo-paypal",
      title: t("addPayoutMethod.methods.paypal.title"),
      subtitle: t("addPayoutMethod.methods.paypal.subtitle"),
      recommended: false,
      features: [
        t("addPayoutMethod.methods.paypal.feature1"),
        t("addPayoutMethod.methods.paypal.feature2"),
        t("addPayoutMethod.methods.paypal.feature3"),
        t("addPayoutMethod.methods.paypal.feature4"),
      ],
    },
    {
      type: "Solana" as PayoutMethodType,
      cryptoConfig: { currency: "USDC", network: "solana-mainnet" },
      icon: "wallet-outline",
      title: t("addPayoutMethod.methods.usdcSolana.title"),
      subtitle: t("addPayoutMethod.methods.usdcSolana.subtitle"),
      recommended: false,
      features: [
        t("addPayoutMethod.methods.usdcSolana.feature1"),
        t("addPayoutMethod.methods.usdcSolana.feature2"),
        t("addPayoutMethod.methods.usdcSolana.feature3"),
        t("addPayoutMethod.methods.usdcSolana.feature4"),
      ],
    },
    {
      type: "Solana" as PayoutMethodType,
      cryptoConfig: { currency: "EURC", network: "solana-mainnet" },
      icon: "wallet-outline",
      title: t("addPayoutMethod.methods.eurcSolana.title"),
      subtitle: t("addPayoutMethod.methods.eurcSolana.subtitle"),
      recommended: false,
      features: [
        t("addPayoutMethod.methods.eurcSolana.feature1"),
        t("addPayoutMethod.methods.eurcSolana.feature2"),
        t("addPayoutMethod.methods.eurcSolana.feature3"),
        t("addPayoutMethod.methods.eurcSolana.feature4"),
      ],
    },
  ];

  const handleSelectMethod = (method: {
    type: PayoutMethodType;
    cryptoConfig?: { currency: string; network: string };
  }) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert(
        t("addPayoutMethod.selectMethod"),
        t("addPayoutMethod.pleaseSelect")
      );
      return;
    }

    // Navigate to the specific configuration screen
    switch (selectedMethod.type) {
      case "BankTransfer":
      case "Wise":
        router.push("/add-iban-method");
        break;
      case "PayPal":
        router.push("/add-paypal-method");
        break;
      case "Solana":
      case "Crypto":
        router.push({
          pathname: "/add-crypto-method",
          params: {
            methodType: selectedMethod.type,
            currency: selectedMethod.cryptoConfig?.currency || "USDC",
            network: selectedMethod.cryptoConfig?.network || "solana-mainnet",
          },
        });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addPayoutMethod.title"),
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("addPayoutMethod.title")}</Text>
          <Text style={styles.subtitle}>{t("addPayoutMethod.subtitle")}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
            <Text style={styles.infoText}>
              {t("addPayoutMethod.platformFee")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#27AE60" />
            <Text style={styles.infoText}>
              {t("addPayoutMethod.yourShare")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#3498DB" />
            <Text style={styles.infoText}>
              {t("addPayoutMethod.providerFees")}
            </Text>
          </View>
        </View>

        {/* Methods List */}
        <View style={styles.methodsList}>
          {payoutMethods.map((method, index) => {
            const isSelected =
              selectedMethod?.type === method.type &&
              selectedMethod?.cryptoConfig?.currency ===
                method.cryptoConfig?.currency;
            return (
              <TouchableOpacity
                key={`${method.type}-${method.cryptoConfig?.currency || index}`}
                style={[
                  styles.methodCard,
                  isSelected && styles.methodCardSelected,
                ]}
                onPress={() =>
                  handleSelectMethod({
                    type: method.type,
                    cryptoConfig: method.cryptoConfig,
                  })
                }
              >
                {method.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>
                      {t("addPayoutMethod.recommended")}
                    </Text>
                  </View>
                )}

                <View style={styles.methodHeader}>
                  <View style={styles.methodIcon}>
                    <Ionicons
                      name={method.icon as any}
                      size={28}
                      color={isSelected ? "#4ECDC4" : "#2C3E50"}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4ECDC4"
                    />
                  )}
                </View>

                <View style={styles.methodFeatures}>
                  {method.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureRow}>
                      <Ionicons name="checkmark" size={16} color="#27AE60" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Ionicons name="document-text-outline" size={16} color="#7F8C8D" />
          <Text style={styles.legalText}>
            {t("addPayoutMethod.legalNotice")}
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
          <Text style={styles.continueButtonText}>
            {t("addPayoutMethod.continue")}
          </Text>
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
