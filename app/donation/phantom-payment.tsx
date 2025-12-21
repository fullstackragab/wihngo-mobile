/**
 * Phantom Wallet Payment Screen
 * Handles payment via Phantom wallet using Solana Pay deep linking
 */

import {
  executePhantomPayment,
  getSolanaExplorerUrl,
  isPhantomInstalled,
  openPhantomInstallPage,
  type SupportedToken,
} from "@/services/phantom-wallet.service";
import {
  formatInvoiceAmount,
  getStatusDisplayText,
  isTerminalStatus,
} from "@/services/donation.service";
import { getInvoice } from "@/services/invoice.service";
import { sseService } from "@/services/sse.service";
import type { Invoice, InvoiceEvent } from "@/types/invoice";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentStep =
  | "loading"
  | "ready"
  | "opening_phantom"
  | "waiting_for_payment"
  | "confirming"
  | "success"
  | "error";

export default function PhantomPaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ invoiceId: string }>();
  const appState = useRef(AppState.currentState);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState<PaymentStep>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");

  useEffect(() => {
    loadInvoice();
  }, []);

  // Listen for app state changes (user returning from Phantom)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        // If we were waiting for Phantom, update state
        if (step === "opening_phantom") {
          setStep("waiting_for_payment");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [step]);

  useEffect(() => {
    if (!params.invoiceId) return;

    // Subscribe to invoice events via SSE
    const unsubscribe = sseService.subscribeToInvoice(
      params.invoiceId,
      handleInvoiceEvent
    );

    return () => {
      unsubscribe.then((fn) => fn());
    };
  }, [params.invoiceId]);

  const loadInvoice = async () => {
    try {
      setStep("loading");
      const invoiceData = await getInvoice(params.invoiceId);
      setInvoice(invoiceData);

      // Check if already completed
      if (isTerminalStatus(invoiceData.payment_status)) {
        router.replace({
          pathname: "/donation/result",
          params: { invoiceId: invoiceData.id },
        });
        return;
      }

      // Check if Phantom is installed
      const phantomAvailable = await isPhantomInstalled();
      if (!phantomAvailable) {
        setStep("error");
        setErrorMessage(
          t(
            "donation.phantomNotInstalledError",
            "Phantom wallet is not installed. Please install it to continue."
          )
        );
        return;
      }

      setStep("ready");
    } catch (error) {
      console.error("Error loading invoice:", error);
      setStep("error");
      setErrorMessage(
        t("donation.loadInvoiceError", "Failed to load invoice details")
      );
    }
  };

  const handleInvoiceEvent = (event: InvoiceEvent) => {
    console.log("Invoice event:", event);

    if (event.data.status) {
      setInvoice((prev) =>
        prev ? { ...prev, payment_status: event.data.status! } : null
      );

      // Update UI based on status
      if (event.data.status === "PROCESSING") {
        setStep("confirming");
      }

      if (isTerminalStatus(event.data.status)) {
        if (event.data.status === "CONFIRMED") {
          setStep("success");
          if (event.data.transaction_hash) {
            setTransactionSignature(event.data.transaction_hash);
          }
        }
        // Navigate to result after a short delay
        setTimeout(() => {
          router.replace({
            pathname: "/donation/result",
            params: { invoiceId: event.invoice_id },
          });
        }, 2000);
      }
    }

    if (event.event_type === "PAYMENT_DETECTED") {
      setStep("confirming");
      Alert.alert(
        t("donation.paymentDetected", "Payment Detected!"),
        t("donation.paymentDetectedMsg", "We've detected your payment. Waiting for confirmation...")
      );
    } else if (event.event_type === "PAYMENT_CONFIRMED") {
      setStep("success");
      if (event.data.transaction_hash) {
        setTransactionSignature(event.data.transaction_hash);
      }
    }
  };

  const handlePayWithPhantom = async () => {
    if (!invoice) return;

    try {
      setStep("opening_phantom");
      setErrorMessage("");

      // Determine token type from payment method
      let token: SupportedToken = "USDC";
      if (invoice.token_symbol === "EURC") {
        token = "EURC";
      } else if (invoice.token_symbol === "SOL") {
        token = "SOL";
      }

      // Execute payment via Phantom (opens Phantom with Solana Pay URI)
      const result = await executePhantomPayment({
        recipientAddress: invoice.merchant_address!,
        amount: invoice.expected_token_amount!,
        token,
        invoiceId: invoice.id,
        memo: `WIHNGO:${invoice.id}`,
      });

      if (!result.success) {
        setStep("error");
        setErrorMessage(
          result.error ||
            t("donation.paymentFailed", "Payment failed. Please try again.")
        );
        return;
      }

      // Phantom is now open - user will complete payment there
      // When they return, we'll be in "waiting_for_payment" state
      // The backend will detect the payment via SSE
    } catch (error: any) {
      console.error("Phantom payment error:", error);
      setStep("error");
      setErrorMessage(
        error.message ||
          t("donation.unexpectedError", "An unexpected error occurred")
      );
    }
  };

  const handleInstallPhantom = async () => {
    await openPhantomInstallPage();
  };

  const handleViewTransaction = () => {
    if (transactionSignature) {
      const url = getSolanaExplorerUrl(transactionSignature);
      Linking.openURL(url);
    }
  };

  const handleRetry = () => {
    setStep("ready");
    setErrorMessage("");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSwitchToManual = () => {
    router.replace({
      pathname: "/donation/waiting",
      params: { invoiceId: params.invoiceId },
    });
  };

  if (step === "loading") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#AB9FF2" />
          <Text style={styles.loadingText}>
            {t("donation.loadingInvoice", "Loading invoice...")}
          </Text>
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
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              {t("common.back", "← Back")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {t("donation.phantomPayment", "Phantom Payment")}
          </Text>
        </View>

        {/* Phantom Branding */}
        <View style={styles.phantomBranding}>
          <View style={styles.phantomIconLarge}>
            <Text style={styles.phantomEmoji}>👻</Text>
          </View>
          <Text style={styles.brandingText}>
            {t("donation.payWithPhantom", "Pay with Phantom Wallet")}
          </Text>
        </View>

        {/* Payment Details Card */}
        {invoice && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>
              {t("donation.paymentDetails", "Payment Details")}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("donation.amount", "Amount:")}
              </Text>
              <Text style={styles.detailValue}>
                {formatInvoiceAmount(invoice)}
              </Text>
            </View>

            {invoice.expected_token_amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("donation.youPay", "You'll pay:")}
                </Text>
                <Text style={styles.detailValueBold}>
                  {invoice.expected_token_amount} {invoice.token_symbol}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("donation.recipient", "To:")}
              </Text>
              <Text
                style={styles.detailValueSmall}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {invoice.merchant_address}
              </Text>
            </View>
          </View>
        )}

        {/* Status Content */}
        <View style={styles.statusContainer}>
          {step === "ready" && (
            <>
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>
                  {t("donation.howItWorks", "How it works:")}
                </Text>
                <Text style={styles.instructionStep}>
                  1. {t("donation.step1Phantom", "Tap the button below")}
                </Text>
                <Text style={styles.instructionStep}>
                  2.{" "}
                  {t("donation.step2Phantom", "Phantom will open automatically")}
                </Text>
                <Text style={styles.instructionStep}>
                  3.{" "}
                  {t(
                    "donation.step3Phantom",
                    "Review and approve the transaction"
                  )}
                </Text>
                <Text style={styles.instructionStep}>
                  4.{" "}
                  {t(
                    "donation.step4Phantom",
                    "Return here to see confirmation"
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.phantomButton}
                onPress={handlePayWithPhantom}
                activeOpacity={0.8}
              >
                <Text style={styles.phantomButtonEmoji}>👻</Text>
                <Text style={styles.phantomButtonText}>
                  {t("donation.openPhantom", "Open Phantom & Pay")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchMethodButton}
                onPress={handleSwitchToManual}
              >
                <Text style={styles.switchMethodText}>
                  {t("donation.switchToManual", "Switch to manual transfer")}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === "opening_phantom" && (
            <View style={styles.progressContainer}>
              <View style={styles.approvalAnimation}>
                <Text style={styles.approvalEmoji}>👻</Text>
              </View>
              <Text style={styles.progressTitle}>
                {t("donation.openingPhantom", "Opening Phantom...")}
              </Text>
              <Text style={styles.progressSubtitle}>
                {t(
                  "donation.completeInPhantom",
                  "Complete the payment in Phantom, then return here"
                )}
              </Text>
            </View>
          )}

          {step === "waiting_for_payment" && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#AB9FF2" />
              <Text style={styles.progressTitle}>
                {t("donation.waitingForPayment", "Waiting for Payment")}
              </Text>
              <Text style={styles.progressSubtitle}>
                {t(
                  "donation.didYouComplete",
                  "Did you complete the payment in Phantom?"
                )}
              </Text>
              <View style={styles.waitingActions}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handlePayWithPhantom}
                >
                  <Text style={styles.retryButtonText}>
                    {t("donation.openPhantomAgain", "Open Phantom Again")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.switchMethodButtonWaiting}
                  onPress={handleSwitchToManual}
                >
                  <Text style={styles.switchMethodTextWaiting}>
                    {t("donation.switchToManual", "Switch to manual transfer")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tipCard}>
                <Text style={styles.tipText}>
                  {t(
                    "donation.waitingTip",
                    "Once your payment is confirmed on the blockchain, it will be detected automatically. This usually takes a few seconds."
                  )}
                </Text>
              </View>
            </View>
          )}

          {step === "confirming" && (
            <View style={styles.progressContainer}>
              <View style={styles.confirmingAnimation}>
                <ActivityIndicator size="large" color="#10B981" />
              </View>
              <Text style={styles.progressTitle}>
                {t("donation.confirmingPayment", "Confirming Payment")}
              </Text>
              <Text style={styles.progressSubtitle}>
                {t(
                  "donation.waitingConfirmation",
                  "Waiting for blockchain confirmation..."
                )}
              </Text>
            </View>
          )}

          {step === "success" && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>✓</Text>
              </View>
              <Text style={styles.successTitle}>
                {t("donation.paymentSuccess", "Payment Successful!")}
              </Text>
              <Text style={styles.successSubtitle}>
                {t(
                  "donation.thankYou",
                  "Thank you for your support. Your payment has been confirmed."
                )}
              </Text>
              {transactionSignature && (
                <TouchableOpacity
                  style={styles.viewTxButtonSuccess}
                  onPress={handleViewTransaction}
                >
                  <Text style={styles.viewTxButtonTextSuccess}>
                    {t("donation.viewOnExplorer", "View on Solana Explorer")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === "error" && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorEmoji}>!</Text>
              </View>
              <Text style={styles.errorTitle}>
                {t("donation.paymentError", "Payment Failed")}
              </Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>

              <View style={styles.errorActions}>
                {errorMessage.includes("not installed") ? (
                  <TouchableOpacity
                    style={styles.installButton}
                    onPress={handleInstallPhantom}
                  >
                    <Text style={styles.installButtonText}>
                      {t("donation.installPhantom", "Install Phantom")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.retryButtonText}>
                      {t("donation.tryAgain", "Try Again")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.switchMethodButtonError}
                  onPress={handleSwitchToManual}
                >
                  <Text style={styles.switchMethodTextError}>
                    {t("donation.useManualTransfer", "Use Manual Transfer")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Help Section */}
        {(step === "ready" || step === "error" || step === "waiting_for_payment") && (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>
              {t("donation.needHelp", "Need help?")}
            </Text>
            <Text style={styles.helpText}>
              {t(
                "donation.phantomHelp",
                "Make sure Phantom is installed and you have enough balance to cover the payment and network fees."
              )}
            </Text>
          </View>
        )}
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
  centerContainer: {
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
  header: {
    marginBottom: 20,
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
  phantomBranding: {
    alignItems: "center",
    marginBottom: 20,
  },
  phantomIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#AB9FF2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#AB9FF2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  phantomEmoji: {
    fontSize: 40,
  },
  brandingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  detailsCard: {
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
  cardTitle: {
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
  detailValueSmall: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    maxWidth: 200,
  },
  statusContainer: {
    marginBottom: 16,
  },
  instructionsCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#AB9FF2",
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
  phantomButton: {
    backgroundColor: "#AB9FF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#AB9FF2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  phantomButtonEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  phantomButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  switchMethodButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  switchMethodText: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  progressContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  approvalAnimation: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#AB9FF2",
    justifyContent: "center",
    alignItems: "center",
  },
  approvalEmoji: {
    fontSize: 40,
  },
  waitingActions: {
    marginTop: 20,
    width: "100%",
  },
  switchMethodButtonWaiting: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  switchMethodTextWaiting: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  tipCard: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
  },
  tipText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 18,
  },
  confirmingAnimation: {
    marginBottom: 8,
  },
  viewTxButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  viewTxButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
    color: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  viewTxButtonSuccess: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  viewTxButtonTextSuccess: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorEmoji: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorActions: {
    width: "100%",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  installButton: {
    backgroundColor: "#AB9FF2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  installButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  switchMethodButtonError: {
    paddingVertical: 12,
    alignItems: "center",
  },
  switchMethodTextError: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  helpCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D1D5DB",
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
