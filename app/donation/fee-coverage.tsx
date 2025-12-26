/**
 * Fee Coverage Screen
 * Allows users to optionally cover the platform fee
 * Design follows the locked specification for emotional safety
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PLATFORM_FEE_PERCENT = 0.05; // 5%

export default function FeeCoverageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    birdId?: string;
    birdName?: string;
    amount: string;
    currency: "USD" | "EUR";
    paymentMethod: string;
  }>();

  const amount = parseFloat(params.amount);
  const feeAmount = amount * PLATFORM_FEE_PERCENT;
  const [coverFee, setCoverFee] = useState(true); // Default ON per spec

  const totalAmount = coverFee ? amount + feeAmount : amount;
  const currencySymbol = params.currency === "USD" ? "$" : "€";

  const handleContinue = () => {
    router.push({
      pathname: "/donation/checkout",
      params: {
        birdId: params.birdId,
        birdName: params.birdName,
        amount: totalAmount.toFixed(2),
        currency: params.currency,
        paymentMethod: params.paymentMethod,
        coversFee: coverFee ? "true" : "false",
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
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>
            {t("checkout.sendingTo", {
              amount: currencySymbol + amount.toFixed(2),
              birdName: params.birdName || t("checkout.thisBird")
            })}
          </Text>
          <Text style={styles.birdEmoji}>🐦</Text>
        </View>

        {/* Fee Toggle Card */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <View style={styles.feeTextContainer}>
              <Text style={styles.feeLabel}>{t("checkout.helpSupportWihngo")}</Text>
              <Text style={styles.feeSubLabel}>
                {t("checkout.addFee", { amount: currencySymbol + feeAmount.toFixed(2) })}
              </Text>
            </View>
            <Switch
              value={coverFee}
              onValueChange={setCoverFee}
              trackColor={{ false: "#E5E7EB", true: "#4ECDC4" }}
              thumbColor="#fff"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
          <Text style={styles.feeClarifier}>
            {t("checkout.coversCosts")}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t("checkout.total")}</Text>
          <Text style={styles.totalAmount}>
            {currencySymbol}{totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {t("checkout.continueToPay")}
          </Text>
        </TouchableOpacity>

        {/* How Fees Work Link */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push("/how-fees-work" as any)}
        >
          <Text style={styles.linkText}>{t("checkout.howFeesWork")}</Text>
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
    paddingBottom: 40,
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
  mainContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  birdEmoji: {
    fontSize: 48,
  },
  feeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  feeTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  feeSubLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  feeClarifier: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
