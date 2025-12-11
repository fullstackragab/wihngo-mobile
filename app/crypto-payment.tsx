/**
 * Crypto Payment Screen
 * Complete flow for making cryptocurrency payments
 */

import CryptoCurrencySelector from "@/components/crypto-currency-selector";
import CryptoPaymentQR from "@/components/crypto-payment-qr";
import CryptoPaymentStatus from "@/components/crypto-payment-status";
import NetworkSelector from "@/components/network-selector";
import { useNotifications } from "@/contexts/notification-context";
import {
  calculateCryptoAmount,
  createCryptoPayment,
  getCryptoExchangeRate,
  getSupportedCryptocurrencies,
  pollPaymentStatus,
} from "@/services/crypto.service";
import {
  CryptoCurrency,
  CryptoNetwork,
  CryptoPaymentRequest,
  CryptoPaymentStep,
} from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CryptoPaymentScreen() {
  const params = useLocalSearchParams();
  const amountUsd = parseFloat(params.amount as string) || 0;
  const birdId = params.birdId as string;
  const plan = params.plan as "monthly" | "yearly" | "lifetime";
  const purpose = (params.purpose as any) || "premium_subscription";

  const { addNotification } = useNotifications();
  const [step, setStep] = useState<CryptoPaymentStep>("select-currency");
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>();
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const [payment, setPayment] = useState<CryptoPaymentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<any>(null);

  // Get networks for selected currency
  const getNetworksForCurrency = () => {
    if (!selectedCurrency) return [];
    const crypto = getSupportedCryptocurrencies().find(
      (c) => c.code === selectedCurrency
    );
    return crypto?.networks || [];
  };

  const fetchExchangeRate = useCallback(async () => {
    if (!selectedCurrency) return;

    try {
      const rate = await getCryptoExchangeRate(selectedCurrency);
      setExchangeRate(rate.usdRate);
      const amount = calculateCryptoAmount(amountUsd, rate.usdRate);
      setCryptoAmount(amount);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      addNotification(
        "recommendation",
        "Exchange Rate Error",
        "Failed to fetch exchange rate. Please try again."
      );
    }
  }, [selectedCurrency, amountUsd]);

  // Fetch exchange rate when currency is selected
  useEffect(() => {
    if (selectedCurrency) {
      fetchExchangeRate();
    }
  }, [selectedCurrency, fetchExchangeRate]);

  // Handle currency selection
  const handleCurrencySelect = (currency: CryptoCurrency) => {
    setSelectedCurrency(currency);
    const networks = getSupportedCryptocurrencies().find(
      (c) => c.code === currency
    )?.networks;
    if (networks && networks.length === 1) {
      setSelectedNetwork(networks[0]);
    } else {
      setSelectedNetwork(undefined);
    }
    setStep("review-amount");
  };

  // Handle network selection
  const handleNetworkSelect = (network: CryptoNetwork) => {
    setSelectedNetwork(network);
  };

  // Create payment request
  const handleCreatePayment = async () => {
    if (!selectedCurrency || !selectedNetwork) {
      // Missing selections - user can see UI state
      return;
    }

    setLoading(true);
    try {
      const response = await createCryptoPayment({
        birdId,
        amountUsd,
        currency: selectedCurrency,
        network: selectedNetwork,
        purpose,
        plan,
      });

      setPayment(response.paymentRequest);
      setStep("payment-address");
      startPolling(response.paymentRequest.id);
    } catch (error) {
      console.error("Failed to create payment:", error);
      addNotification(
        "recommendation",
        "Payment Error",
        "Failed to create payment request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment status
  const startPolling = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const updatedPayment = await pollPaymentStatus(paymentId);
        setPayment(updatedPayment);

        if (updatedPayment.status === "confirming" && step !== "confirming") {
          setStep("confirming");
        }

        if (
          updatedPayment.status === "completed" ||
          updatedPayment.status === "confirmed"
        ) {
          setStep("completed");
          stopPolling();
        }

        if (
          updatedPayment.status === "expired" ||
          updatedPayment.status === "failed" ||
          updatedPayment.status === "cancelled"
        ) {
          setStep("failed");
          stopPolling();
        }
      } catch (error) {
        console.error("Failed to poll payment status:", error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Handle payment expiration
  const handleExpiration = () => {
    stopPolling();
    setStep("failed");
    // User sees failed step in UI
  };

  // Handle completion
  const handleComplete = () => {
    router.back(); // Success clear from navigation
  };

  const renderStepContent = () => {
    switch (step) {
      case "select-currency":
        return (
          <CryptoCurrencySelector
            selectedCurrency={selectedCurrency}
            onSelect={handleCurrencySelect}
          />
        );

      case "review-amount":
        const networks = getNetworksForCurrency();
        return (
          <View style={styles.reviewContainer}>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <View style={styles.amountDisplay}>
                <Text style={styles.cryptoAmountLarge}>
                  {cryptoAmount.toFixed(8)} {selectedCurrency}
                </Text>
                <Text style={styles.usdAmountLarge}>
                  ≈ ${amountUsd.toFixed(2)} USD
                </Text>
              </View>
              <Text style={styles.exchangeRate}>
                1 {selectedCurrency} = ${exchangeRate.toFixed(2)} USD
              </Text>
            </View>

            <NetworkSelector
              networks={networks}
              selectedNetwork={selectedNetwork}
              onSelect={handleNetworkSelect}
              currency={selectedCurrency!}
            />

            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedNetwork && styles.disabledButton,
              ]}
              onPress={handleCreatePayment}
              disabled={!selectedNetwork || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    Continue to Payment
                  </Text>
                  <FontAwesome6 name="arrow-right" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case "payment-address":
      case "awaiting-payment":
        return payment ? (
          <View>
            <CryptoPaymentQR payment={payment} onExpired={handleExpiration} />
            <CryptoPaymentStatus payment={payment} />
          </View>
        ) : null;

      case "confirming":
        return payment ? (
          <View style={styles.confirmingContainer}>
            <CryptoPaymentStatus payment={payment} showDetails />
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                Waiting for blockchain confirmations...
              </Text>
            </View>
          </View>
        ) : null;

      case "completed":
        return payment ? (
          <View style={styles.completedContainer}>
            <View style={styles.successIcon}>
              <FontAwesome6 name="circle-check" size={64} color="#28a745" />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Your cryptocurrency payment has been confirmed and processed.
            </Text>

            <CryptoPaymentStatus payment={payment} showDetails />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleComplete}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : null;

      case "failed":
        return (
          <View style={styles.failedContainer}>
            <View style={styles.errorIcon}>
              <FontAwesome6 name="circle-xmark" size={64} color="#dc3545" />
            </View>
            <Text style={styles.errorTitle}>Payment Failed</Text>
            <Text style={styles.errorMessage}>
              {payment?.status === "expired"
                ? "The payment window has expired. Please try again."
                : "We couldn't process your payment. Please try again or contact support."}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setStep("select-currency");
                setPayment(null);
              }}
            >
              <FontAwesome6 name="arrow-rotate-right" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay with Crypto</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      {step !== "failed" && step !== "completed" && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressStep,
              (step === "select-currency" || step === "review-amount") &&
                styles.activeStep,
            ]}
          >
            <Text style={styles.progressNumber}>1</Text>
            <Text style={styles.progressLabel}>Select</Text>
          </View>
          <View style={styles.progressLine} />
          <View
            style={[
              styles.progressStep,
              (step === "payment-address" || step === "awaiting-payment") &&
                styles.activeStep,
            ]}
          >
            <Text style={styles.progressNumber}>2</Text>
            <Text style={styles.progressLabel}>Pay</Text>
          </View>
          <View style={styles.progressLine} />
          <View
            style={[
              styles.progressStep,
              step === "confirming" && styles.activeStep,
            ]}
          >
            <Text style={styles.progressNumber}>3</Text>
            <Text style={styles.progressLabel}>Confirm</Text>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {renderStepContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 36,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
  },
  progressStep: {
    alignItems: "center",
    gap: 4,
  },
  activeStep: {
    opacity: 1,
  },
  progressNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    color: "#666",
    textAlign: "center",
    lineHeight: 32,
    fontSize: 14,
    fontWeight: "600",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  reviewContainer: {
    gap: 20,
  },
  amountCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  amountDisplay: {
    alignItems: "center",
    gap: 4,
  },
  cryptoAmountLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  usdAmountLarge: {
    fontSize: 16,
    color: "#666",
  },
  exchangeRate: {
    fontSize: 12,
    color: "#999",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  confirmingContainer: {
    gap: 20,
  },
  loadingBox: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  completedContainer: {
    alignItems: "center",
    gap: 20,
  },
  successIcon: {
    marginVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#28a745",
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  doneButton: {
    width: "100%",
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  failedContainer: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 40,
  },
  errorIcon: {
    marginVertical: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#dc3545",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
});
