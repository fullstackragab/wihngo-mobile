/**
 * Crypto Payment Screen
 * Complete flow for making cryptocurrency payments
 */

import CryptoCurrencySelector from "@/components/crypto-currency-selector";
import CryptoPaymentQR from "@/components/crypto-payment-qr";
import CryptoPaymentStatus from "@/components/crypto-payment-status";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { usePaymentStatusPolling } from "@/hooks/usePaymentStatusPolling";
import {
  calculateCryptoAmount,
  createCryptoPayment,
  getCryptoExchangeRate,
  getEstimatedFee,
  getNetworkName,
  getSupportedCryptocurrencies,
  verifyCryptoPayment,
} from "@/services/crypto.service";
import {
  CryptoCurrency,
  CryptoNetwork,
  CryptoPaymentRequest,
  CryptoPaymentStep,
  getCurrencyForNetwork,
  isValidCurrencyNetwork,
} from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CryptoPaymentScreen() {
  const params = useLocalSearchParams();
  const amountUsd = parseFloat(params.amount as string) || 0;
  const birdId = params.birdId as string;
  const plan = params.plan as "monthly" | "yearly" | "lifetime";
  const purpose = (params.purpose as any) || "premium_subscription";

  const { isAuthenticated, token } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<CryptoPaymentStep>("select-network");
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>();
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const [payment, setPayment] = useState<CryptoPaymentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [enablePolling, setEnablePolling] = useState(false);
  const [showTxHashInput, setShowTxHashInput] = useState(false);
  const [txHashInput, setTxHashInput] = useState("");

  // Use payment status polling hook
  const {
    status: pollingStatus,
    confirmations: pollingConfirmations,
    requiredConfirmations: pollingRequiredConfirmations,
    loading: pollingLoading,
    error: pollingError,
    paymentData,
    forceCheck,
  } = usePaymentStatusPolling({
    paymentId: payment?.id || "",
    authToken: token || "",
    enabled: enablePolling && !!payment?.id && !!token,
    onStatusChange: (updatedPayment) => {
      console.log("📊 Payment status changed:", updatedPayment.status);
      setPayment(updatedPayment as CryptoPaymentRequest);

      // Handle status transitions
      if (updatedPayment.status === "confirming" && step !== "confirming") {
        console.log("✅ Transaction detected, waiting for confirmations...");
        setStep("confirming");
        addNotification(
          "recommendation",
          "Transaction Detected",
          "Your transaction is being confirmed on the blockchain."
        );
      }

      if (
        updatedPayment.status === "completed" ||
        updatedPayment.status === "confirmed"
      ) {
        console.log("🎉 Payment completed successfully!");
        setStep("completed");
        setEnablePolling(false);
        addNotification(
          "recommendation",
          "Payment Confirmed",
          "Your crypto payment has been confirmed!"
        );
      }

      if (
        updatedPayment.status === "expired" ||
        updatedPayment.status === "failed" ||
        updatedPayment.status === "cancelled"
      ) {
        console.log("❌ Payment failed/expired:", updatedPayment.status);
        setStep("failed");
        setEnablePolling(false);
      }
    },
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      addNotification(
        "recommendation",
        "Authentication Required",
        "Please login to make a payment."
      );
      router.replace("/welcome");
    }
  }, [isAuthenticated, token]);

  // Get network details helper
  const getNetworkDetails = (network: CryptoNetwork) => {
    const details: Record<
      CryptoNetwork,
      { speed: string; confirmations: number }
    > = {
      tron: { speed: "Fast (1-2 min)", confirmations: 19 },
      ethereum: { speed: "Medium (2-5 min)", confirmations: 12 },
      "binance-smart-chain": { speed: "Fast (1-3 min)", confirmations: 15 },
      bitcoin: { speed: "Slow (10-30 min)", confirmations: 2 },
      solana: { speed: "Very Fast (30-60 sec)", confirmations: 32 },
      polygon: { speed: "Fast (1-3 min)", confirmations: 128 },
      sepolia: { speed: "Fast (1-2 min) [TEST]", confirmations: 6 },
    };
    return details[network] || { speed: "Unknown", confirmations: 0 };
  };

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

  // Handle network selection and proceed to currency selection
  const handleNetworkSelect = (network: CryptoNetwork) => {
    setSelectedNetwork(network);
    setStep("select-currency");
  };

  // Create payment request
  const handleCreatePayment = async () => {
    if (!selectedCurrency || !selectedNetwork) {
      // Missing selections - user can see UI state
      return;
    }

    // Validate currency-network combination
    if (!isValidCurrencyNetwork(selectedCurrency, selectedNetwork)) {
      addNotification(
        "recommendation",
        "Invalid Configuration",
        `${selectedCurrency} is not supported on ${getNetworkName(
          selectedNetwork
        )}`
      );
      return;
    }

    // Check authentication before making payment
    if (!isAuthenticated || !token) {
      addNotification(
        "recommendation",
        "Authentication Required",
        "Please login to make a payment."
      );
      router.replace("/welcome");
      return;
    }

    setLoading(true);
    try {
      console.log("💰 Creating payment with:", {
        currency: selectedCurrency,
        network: selectedNetwork,
        amountUsd,
      });

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
      setEnablePolling(true);
    } catch (error: any) {
      console.error("Failed to create payment:", error);

      // Check if it's an authentication error
      if (error?.message?.includes("Session expired")) {
        addNotification(
          "recommendation",
          "Session Expired",
          "Your session has expired. Please login again."
        );
        // Navigate back - AuthContext will handle the logout
        setTimeout(() => router.replace("/welcome"), 1500);
      } else {
        addNotification(
          "recommendation",
          "Payment Error",
          "Failed to create payment request. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh payment status using the hook's forceCheck
  const handleRefreshStatus = async () => {
    if (!payment?.id) return;

    console.log("🔄 Manual refresh triggered");
    try {
      await forceCheck();
    } catch (error: any) {
      console.error("❌ Manual refresh failed:", error);
      addNotification(
        "recommendation",
        "Refresh Failed",
        "Could not refresh payment status. Please try again."
      );
    }
  };

  // Manual transaction verification
  const handleVerifyTransaction = async () => {
    if (!payment?.id || !txHashInput.trim()) {
      addNotification(
        "recommendation",
        "Missing Information",
        "Please enter a transaction hash to verify."
      );
      return;
    }

    console.log("🔍 Manual transaction verification:", txHashInput);
    setLoading(true);
    try {
      const updatedPayment = await verifyCryptoPayment(payment.id, {
        transactionHash: txHashInput.trim(),
      });
      console.log("✅ Transaction verified:", {
        status: updatedPayment.status,
        confirmations: updatedPayment.confirmations,
      });
      setPayment(updatedPayment);
      setTxHashInput("");
      setShowTxHashInput(false);

      // Enable polling after verification
      setEnablePolling(true);

      if (updatedPayment.status === "confirming") {
        setStep("confirming");
        addNotification(
          "recommendation",
          "Transaction Found",
          "Your transaction is being confirmed on the blockchain."
        );
      }

      if (
        updatedPayment.status === "completed" ||
        updatedPayment.status === "confirmed"
      ) {
        setStep("completed");
        addNotification(
          "recommendation",
          "Payment Confirmed",
          "Your crypto payment has been confirmed!"
        );
      }
    } catch (error: any) {
      console.error("❌ Transaction verification failed:", error);
      addNotification(
        "recommendation",
        "Verification Failed",
        error?.message ||
          "Could not verify transaction. Please check the transaction hash and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle payment expiration
  const handleExpiration = () => {
    setEnablePolling(false);
    setStep("failed");
    // User sees failed step in UI
  };

  // Handle completion
  const handleComplete = () => {
    router.back(); // Success clear from navigation
  };

  const renderStepContent = () => {
    switch (step) {
      case "select-network":
        // Show all available networks
        const allNetworks: CryptoNetwork[] = [
          "tron",
          "ethereum",
          "binance-smart-chain",
        ];
        return (
          <View style={styles.networkSelectionContainer}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoTitle}>
                Select Blockchain Network
              </Text>
              <Text style={styles.headerSubtitle}>
                Choose your preferred blockchain network first
              </Text>
              <View style={styles.amountPreview}>
                <Text style={styles.amountPreviewLabel}>Amount to Pay</Text>
                <Text style={styles.amountPreviewValue}>
                  ${amountUsd.toFixed(2)} USD
                </Text>
              </View>
            </View>
            <View style={styles.networkList}>
              {allNetworks.map((network) => {
                const isSelected = selectedNetwork === network;
                const details = getNetworkDetails(network);
                return (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.networkCard,
                      isSelected && styles.selectedCard,
                    ]}
                    onPress={() => {
                      setSelectedNetwork(network);
                      setStep("select-currency");
                    }}
                  >
                    <View style={styles.networkInfo}>
                      <Text style={styles.networkName}>
                        {getNetworkName(network)}
                      </Text>
                      <Text style={styles.networkDetail}>{details.speed}</Text>
                      <Text style={styles.networkDetail}>
                        Fee: ~$
                        {getEstimatedFee(
                          getCurrencyForNetwork(network),
                          network
                        ).toFixed(2)}
                      </Text>
                    </View>
                    {isSelected && (
                      <FontAwesome6
                        name="circle-check"
                        size={24}
                        color="#007AFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case "select-currency":
        return (
          <View style={styles.currencySelectionContainer}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoTitle}>Select Currency</Text>
              <Text style={styles.headerSubtitle}>
                Available on{" "}
                {selectedNetwork && getNetworkName(selectedNetwork)}
              </Text>
              <TouchableOpacity
                style={styles.changeNetworkButton}
                onPress={() => setStep("select-network")}
                disabled={loading}
              >
                <FontAwesome6 name="arrow-left" size={14} color="#007AFF" />
                <Text style={styles.changeNetworkText}>Change Network</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Creating payment...</Text>
              </View>
            ) : (
              <CryptoCurrencySelector
                selectedCurrency={selectedCurrency}
                onSelect={async (currency) => {
                  setSelectedCurrency(currency);
                  // Immediately create payment after currency selection
                  setLoading(true);
                  try {
                    console.log("💰 Creating payment with:", {
                      currency,
                      network: selectedNetwork,
                      amountUsd,
                    });

                    const response = await createCryptoPayment({
                      birdId,
                      amountUsd,
                      currency,
                      network: selectedNetwork!,
                      purpose,
                      plan,
                    });

                    setPayment(response.paymentRequest);
                    setStep("payment-address");
                    setEnablePolling(true);
                  } catch (error: any) {
                    console.error("Failed to create payment:", error);

                    // Check if it's an authentication error
                    if (error?.message?.includes("Session expired")) {
                      addNotification(
                        "recommendation",
                        "Session Expired",
                        "Your session has expired. Please login again."
                      );
                      setTimeout(() => router.replace("/welcome"), 1500);
                    } else {
                      addNotification(
                        "recommendation",
                        "Payment Error",
                        "Failed to create payment request. Please try again."
                      );
                      setStep("select-network");
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                network={selectedNetwork}
              />
            )}
          </View>
        );

      case "review-amount":
        const reviewNetworks = getNetworksForCurrency();
        return (
          <View style={styles.reviewContainer}>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Payment Summary</Text>
              <View style={styles.amountDisplay}>
                <Text style={styles.cryptoAmountLarge}>
                  {selectedCurrency === "ETH"
                    ? cryptoAmount.toFixed(8)
                    : cryptoAmount.toFixed(6)}{" "}
                  {selectedCurrency}
                </Text>
                <Text style={styles.usdAmountLarge}>
                  ≈ ${amountUsd.toFixed(2)} USD
                </Text>
              </View>
              <Text style={styles.exchangeRate}>
                1 {selectedCurrency} ≈ ${exchangeRate.toFixed(4)} USD
              </Text>
            </View>

            <View style={styles.networkInfoCard}>
              <Text style={styles.networkInfoLabel}>Selected Network</Text>
              <Text style={styles.networkInfoValue}>
                {selectedNetwork && getNetworkName(selectedNetwork)}
              </Text>
              <TouchableOpacity
                style={styles.changeNetworkButton}
                onPress={() => setStep("select-network")}
              >
                <Text style={styles.changeNetworkText}>Change Network</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purpose:</Text>
                <Text style={styles.detailValue}>
                  {purpose === "premium_subscription"
                    ? `Premium ${plan || "subscription"}`
                    : purpose}
                </Text>
              </View>
              {selectedNetwork && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Network Fee:</Text>
                  <Text style={styles.detailValue}>
                    ~$
                    {getEstimatedFee(selectedCurrency, selectedNetwork).toFixed(
                      2
                    )}{" "}
                    USD
                  </Text>
                </View>
              )}
            </View>

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
            <CryptoPaymentQR payment={payment} onExpired={handleExpiration}>
              <CryptoPaymentStatus payment={payment} />
            </CryptoPaymentQR>

            {/* Debug info */}
            {__DEV__ && (
              <View
                style={{
                  padding: 12,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: "monospace" }}>
                  🐛 Debug: Polling={enablePolling ? "ON" : "OFF"} | Status=
                  {payment.status} | PollingStatus={pollingStatus || "null"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshStatus}
              disabled={pollingLoading}
            >
              {pollingLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <FontAwesome6
                    name="arrow-rotate-right"
                    size={16}
                    color="#007AFF"
                  />
                  <Text style={styles.refreshButtonText}>Check Status Now</Text>
                </>
              )}
            </TouchableOpacity>

            {pollingError && (
              <View style={styles.errorContainer}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={14}
                  color="#dc3545"
                />
                <Text style={styles.errorText}>{pollingError}</Text>
              </View>
            )}

            {!showTxHashInput ? (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => setShowTxHashInput(true)}
              >
                <FontAwesome6 name="magnifying-glass" size={14} color="#666" />
                <Text style={styles.verifyButtonText}>
                  Manual Verification (Optional)
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.txHashContainer}>
                <Text style={styles.txHashLabel}>
                  Enter Transaction Hash (Optional):
                </Text>
                <Text style={styles.txHashSubLabel}>
                  Automatic detection is active. Manual verification is only
                  needed if you want instant confirmation.
                </Text>
                <TextInput
                  style={styles.txHashInput}
                  value={txHashInput}
                  onChangeText={setTxHashInput}
                  placeholder="Enter transaction hash (txid)"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.txHashButtons}>
                  <TouchableOpacity
                    style={styles.txHashButtonCancel}
                    onPress={() => {
                      setShowTxHashInput(false);
                      setTxHashInput("");
                    }}
                  >
                    <Text style={styles.txHashButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.txHashButtonVerify,
                      !txHashInput.trim() && styles.disabledButton,
                    ]}
                    onPress={handleVerifyTransaction}
                    disabled={!txHashInput.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.txHashButtonVerifyText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.autoDetectInfoBox}>
              <FontAwesome6 name="robot" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>
                🚀{" "}
                <Text style={styles.infoTextBold}>
                  Automatic Detection Active:
                </Text>{" "}
                We&apos;re scanning the blockchain every 30 seconds. Your
                payment will be detected within 10-60 seconds after sending. No
                manual action required!
              </Text>
            </View>
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
  networkSelectionContainer: {
    gap: 20,
  },
  currencySelectionContainer: {
    gap: 20,
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
  networkInfo: {
    flex: 1,
    gap: 6,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  networkDetail: {
    fontSize: 13,
    color: "#666",
  },
  headerInfo: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  headerInfoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  amountPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    gap: 4,
  },
  amountPreviewLabel: {
    fontSize: 12,
    color: "#666",
  },
  amountPreviewValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  amountPreviewCrypto: {
    fontSize: 14,
    color: "#666",
  },
  networkInfoCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  networkInfoLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  networkInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  changeNetworkButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeNetworkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  infoText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  verifyButtonText: {
    fontSize: 13,
    color: "#666",
  },
  txHashContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    gap: 12,
  },
  txHashLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  txHashSubLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: -6,
    fontStyle: "italic",
  },
  txHashInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: "monospace",
    color: "#333",
  },
  txHashButtons: {
    flexDirection: "row",
    gap: 12,
  },
  txHashButtonCancel: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  txHashButtonCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  txHashButtonVerify: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  txHashButtonVerifyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  autoDetectInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoTextBold: {
    fontWeight: "600",
    color: "#2E7D32",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#dc3545",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
});
