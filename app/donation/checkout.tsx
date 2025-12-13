/**
 * Checkout Screen
 * Shows invoice details and payment URIs
 */

import { getTimeRemaining, startDonation } from "@/services/donation.service";
import type { Invoice } from "@/types/invoice";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    birdId?: string;
    birdName?: string;
    amount: string;
    currency: "USD" | "EUR";
    paymentMethod: string;
  }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ minutes: 15, seconds: 0, expired: false });

  useEffect(() => {
    createInvoice();
  }, []);

  useEffect(() => {
    if (invoice?.expires_at) {
      const timer = setInterval(() => {
        const remaining = getTimeRemaining(invoice.expires_at!);
        setTimeRemaining(remaining);

        if (remaining.expired) {
          clearInterval(timer);
          Alert.alert(
            "Invoice Expired",
            "This invoice has expired. Please create a new one.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [invoice]);

  const createInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = await startDonation({
        bird_id: params.birdId,
        amount_fiat: parseFloat(params.amount),
        fiat_currency: params.currency as "USD" | "EUR",
        payment_method: params.paymentMethod as any,
      });
      setInvoice(invoiceData);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create invoice. Please try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!invoice) return;

    // Navigate to appropriate payment flow
    if (invoice.payment_method === "paypal") {
      if (invoice.paypal_checkout_url) {
        await Linking.openURL(invoice.paypal_checkout_url);
        // Navigate to waiting screen
        router.replace({
          pathname: "/donation/waiting",
          params: { invoiceId: invoice.id },
        });
      } else {
        Alert.alert("Error", "PayPal checkout URL not available");
      }
    } else if (invoice.payment_method.startsWith("solana_")) {
      // Navigate to Solana payment screen
      router.push({
        pathname: "/donation/waiting",
        params: { invoiceId: invoice.id },
      });
    } else if (invoice.payment_method.startsWith("base_")) {
      // Navigate to Base payment screen
      router.push({
        pathname: "/donation/waiting",
        params: { invoiceId: invoice.id },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to create invoice</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
        </View>

        {/* Timer */}
        {!timeRemaining.expired && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time remaining:</Text>
            <Text style={styles.timerText}>
              {String(timeRemaining.minutes).padStart(2, "0")}:
              {String(timeRemaining.seconds).padStart(2, "0")}
            </Text>
          </View>
        )}

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalText}>
            ⚠️ Wihngo is a for-profit company. This payment is a
            contribution/support and is{" "}
            <Text style={styles.legalBold}>not a charitable donation</Text>.
            Payments are not tax deductible unless explicitly stated otherwise.
          </Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceCard}>
          <Text style={styles.invoiceLabel}>Invoice Details</Text>

          {invoice.invoice_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice #:</Text>
              <Text style={styles.detailValue}>{invoice.invoice_number}</Text>
            </View>
          )}

          {params.birdName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supporting:</Text>
              <Text style={styles.detailValue}>{params.birdName}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValueBold}>
              {invoice.fiat_currency === "USD" ? "$" : "€"}
              {invoice.amount_fiat.toFixed(2)}
            </Text>
          </View>

          {invoice.expected_token_amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>You'll pay:</Text>
              <Text style={styles.detailValue}>
                {invoice.expected_token_amount} {invoice.token_symbol}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {getPaymentMethodName(invoice.payment_method)}
            </Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Next Steps:</Text>
          {invoice.payment_method === "paypal" ? (
            <>
              <Text style={styles.instructionStep}>
                1. Click "Pay with PayPal" below
              </Text>
              <Text style={styles.instructionStep}>
                2. Log in to your PayPal account
              </Text>
              <Text style={styles.instructionStep}>3. Confirm the payment</Text>
              <Text style={styles.instructionStep}>
                4. You'll be redirected back to see your receipt
              </Text>
            </>
          ) : invoice.payment_method.startsWith("solana_") ? (
            <>
              <Text style={styles.instructionStep}>
                1. Click "Open Wallet" to launch your Solana wallet
              </Text>
              <Text style={styles.instructionStep}>
                2. Approve the transaction
              </Text>
              <Text style={styles.instructionStep}>
                3. We'll detect your payment automatically
              </Text>
              <Text style={styles.instructionStep}>
                4. Your receipt will be available once confirmed
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.instructionStep}>
                1. Click "Connect Wallet" to connect your Web3 wallet
              </Text>
              <Text style={styles.instructionStep}>
                2. Approve the transaction
              </Text>
              <Text style={styles.instructionStep}>
                3. We'll detect your payment automatically
              </Text>
              <Text style={styles.instructionStep}>
                4. Your receipt will be available once confirmed
              </Text>
            </>
          )}
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            timeRemaining.expired && styles.payButtonDisabled,
          ]}
          onPress={handlePayNow}
          disabled={timeRemaining.expired}
        >
          <Text style={styles.payButtonText}>
            {invoice.payment_method === "paypal"
              ? "Pay with PayPal"
              : invoice.payment_method.startsWith("solana_")
              ? "Open Wallet"
              : "Connect Wallet"}
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          If you need an invoice with specific company details for accounting,
          update your profile or contact support@wihngo.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function getPaymentMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    paypal: "PayPal",
    solana_usdc: "USDC (Solana)",
    solana_eurc: "EURC (Solana)",
    base_usdc: "USDC (Base)",
    base_eurc: "EURC (Base)",
  };
  return methodMap[method] || method;
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
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
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: "#1E40AF",
    marginRight: 8,
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E40AF",
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
  invoiceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  detailValueBold: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  instructionsCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: "#1E40AF",
    marginBottom: 6,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
  },
});
