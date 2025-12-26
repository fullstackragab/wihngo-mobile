/**
 * Donation Screen
 * Allows users to select a bird and amount to support
 */

import { getBirdByIdService } from "@/services/bird.service";
import type { Bird } from "@/types/bird";
import type { PaymentMethod } from "@/types/invoice";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    icon: "💳",
  },
  {
    id: "solana_usdc",
    name: "USDC (Solana)",
    description: "Pay with USDC on Solana",
    icon: "◎",
  },
  {
    id: "solana_eurc",
    name: "EURC (Solana)",
    description: "Pay with EURC on Solana",
    icon: "◎",
  },
  {
    id: "base_usdc",
    name: "USDC (Base)",
    description: "Pay with USDC on Base",
    icon: "🔵",
  },
  {
    id: "base_eurc",
    name: "EURC (Base)",
    description: "Pay with EURC on Base",
    icon: "🔵",
  },
];

export default function DonationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ birdId?: string }>();

  const [bird, setBird] = useState<Bird | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("paypal");
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [loading, setLoading] = useState(false);
  const [loadingBird, setLoadingBird] = useState(false);

  useEffect(() => {
    if (params.birdId) {
      loadBird(params.birdId);
    }
  }, [params.birdId]);

  const loadBird = async (birdId: string) => {
    try {
      setLoadingBird(true);
      const birdData = await getBirdByIdService(birdId);
      setBird(birdData);
    } catch (error) {
      console.error("Error loading bird:", error);
      Alert.alert(t("alerts.error"), t("donations.failedToLoadBird"));
    } finally {
      setLoadingBird(false);
    }
  };

  const handleContinue = () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t("alerts.invalidInput"), t("donations.invalidAmount"));
      return;
    }

    if (amountNum < 1) {
      Alert.alert(t("alerts.invalidInput"), t("donations.minAmount", { amount: 1 }));
      return;
    }

    // Navigate to fee coverage screen
    router.push({
      pathname: "/donation/fee-coverage" as any,
      params: {
        birdId: bird?.birdId,
        birdName: bird?.name,
        amount: amountNum.toString(),
        currency,
        paymentMethod: selectedPaymentMethod,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("donations.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {bird ? t("checkout.supportBird", { birdName: bird.name }) : t("donations.supportWihngo")}
          </Text>
        </View>

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalText}>⚠️ {t("donations.disclaimer")}</Text>
        </View>

        {/* Bird Selection */}
        {loadingBird ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : bird ? (
          <View style={styles.birdCard}>
            <Text style={styles.birdEmoji}>🐦</Text>
            <Text style={styles.birdName}>{bird.name}</Text>
            <Text style={styles.birdDescription}>
              {t("checkout.goesToOwner", { ownerName: bird.ownerName || t("checkout.theOwner"), birdName: bird.name })}
            </Text>
          </View>
        ) : (
          <View style={styles.birdCard}>
            <Text style={styles.birdLabel}>{t("donations.generalSupport")}</Text>
            <Text style={styles.birdDescription}>
              {t("donations.disclaimer")}
            </Text>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("donations.amount")}</Text>
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "USD" && styles.currencyButtonActive,
              ]}
              onPress={() => setCurrency("USD")}
            >
              <Text
                style={[
                  styles.currencyButtonText,
                  currency === "USD" && styles.currencyButtonTextActive,
                ]}
              >
                {t("donations.usd")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "EUR" && styles.currencyButtonActive,
              ]}
              onPress={() => setCurrency("EUR")}
            >
              <Text
                style={[
                  styles.currencyButtonText,
                  currency === "EUR" && styles.currencyButtonTextActive,
                ]}
              >
                {t("donations.eur")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>
              {currency === "USD" ? "$" : "€"}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
          <View style={styles.quickAmounts}>
            {[1, 3, 5, 10, 25].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>
                  {currency === "USD" ? "$" : "€"}
                  {quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("donations.paymentMethod")}</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === method.id &&
                  styles.paymentMethodCardActive,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodIcon}>
                <Text style={styles.paymentMethodIconText}>{method.icon}</Text>
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <Text style={styles.paymentMethodDescription}>
                  {method.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedPaymentMethod === method.id && styles.radioActive,
                ]}
              >
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            loading && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>
              {t("donations.continueToPayment")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  legalNotice: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  legalText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
  legalBold: {
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  birdCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  birdEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  birdLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  birdName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  birdDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  currencyButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  currencyButtonTextActive: {
    color: "#fff",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    paddingVertical: 16,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  paymentMethodCardActive: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F9FF",
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentMethodIconText: {
    fontSize: 20,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#007AFF",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  continueButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
