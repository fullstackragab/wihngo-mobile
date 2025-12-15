/**
 * Waiting for Payment Screen
 * Shows payment status and wallet actions
 */

import {
  formatInvoiceAmount,
  getStatusDisplayText,
  isTerminalStatus,
} from "@/services/donation.service";
import { getInvoice, submitPayment } from "@/services/invoice.service";
import { sseService } from "@/services/sse.service";
import {
  buildSolanaPayUri,
  copySolanaPayUri,
  getExplorerUrl,
  openSolanaPayUri,
} from "@/services/wallet.service";
import type { Invoice, InvoiceEvent } from "@/types/invoice";
import { useAppKit } from "@reown/appkit-react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WaitingForPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ invoiceId: string }>();
  const { open: openWalletModal } = useAppKit();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");

  useEffect(() => {
    loadInvoice();
  }, []);

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
      setLoading(true);
      const invoiceData = await getInvoice(params.invoiceId);
      setInvoice(invoiceData);

      // If already confirmed, navigate to result screen
      if (isTerminalStatus(invoiceData.payment_status)) {
        router.replace({
          pathname: "/donation/result",
          params: { invoiceId: invoiceData.id },
        });
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      Alert.alert("Error", "Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceEvent = (event: InvoiceEvent) => {
    console.log("Invoice event:", event);

    // Update invoice status
    if (event.data.status) {
      setInvoice((prev) =>
        prev ? { ...prev, payment_status: event.data.status! } : null
      );

      // Navigate to result if terminal status
      if (isTerminalStatus(event.data.status)) {
        router.replace({
          pathname: "/donation/result",
          params: { invoiceId: event.invoice_id },
        });
      }
    }

    // Show notification for important events
    if (event.event_type === "PAYMENT_DETECTED") {
      Alert.alert(
        "Payment Detected!",
        "We've detected your payment. Waiting for confirmation..."
      );
    } else if (event.event_type === "PAYMENT_CONFIRMED") {
      Alert.alert(
        "Payment Confirmed!",
        "Your payment has been confirmed on the blockchain."
      );
    } else if (event.event_type === "INVOICE_ISSUED") {
      Alert.alert(
        "Receipt Ready!",
        "Your receipt is now available for download."
      );
    }
  };

  const handleOpenWallet = async () => {
    if (!invoice) return;

    try {
      setProcessing(true);

      if (invoice.payment_method.startsWith("solana_")) {
        const uri = buildSolanaPayUri(invoice);
        await openSolanaPayUri(uri);
      } else {
        // Only Solana is supported
        Alert.alert(
          "Unsupported Payment Method",
          "Only Solana network is supported for crypto payments."
        );
        return;
      }
    } catch (error: any) {
      console.error("Error opening wallet:", error);
      Alert.alert("Error", error.message || "Failed to open wallet");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyUri = async () => {
    if (!invoice) return;

    try {
      if (invoice.payment_method.startsWith("solana_")) {
        const uri = buildSolanaPayUri(invoice);
        await copySolanaPayUri(uri);
        Alert.alert("Copied!", "Payment URI copied to clipboard");
      } else if (invoice.merchant_address) {
        await Clipboard.setStringAsync(invoice.merchant_address);
        Alert.alert("Copied!", "Merchant address copied to clipboard");
      }
    } catch (error) {
      console.error("Error copying URI:", error);
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const handleShowQr = () => {
    setShowQrModal(true);
  };

  const handleReportPayment = async () => {
    if (!manualTxHash.trim()) {
      Alert.alert("Invalid Input", "Please enter a transaction hash");
      return;
    }

    try {
      setProcessing(true);
      await submitPayment({
        invoice_id: invoice!.id,
        transaction_hash: manualTxHash.trim(),
        payer_address: "", // Optional
        network: invoice!.network || "solana",
        token_symbol: invoice!.token_symbol || "USDC",
      });

      setShowReportModal(false);
      setManualTxHash("");
      Alert.alert(
        "Payment Reported",
        "Thank you! We'll verify your payment and update the status shortly."
      );
    } catch (error: any) {
      console.error("Error reporting payment:", error);
      Alert.alert("Error", error.message || "Failed to report payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewExplorer = () => {
    if (!invoice?.transaction_hash || !invoice?.network) return;

    const url = getExplorerUrl(invoice.transaction_hash, invoice.network);
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusDisplay = getStatusDisplayText(invoice.payment_status);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Status</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusDisplay.color + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusDisplay.color },
              ]}
            />
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>

          {invoice.payment_status === "PENDING_PAYMENT" && (
            <Text style={styles.statusDescription}>
              Waiting for your payment. Please complete the transaction in your
              wallet.
            </Text>
          )}
          {invoice.payment_status === "PROCESSING" && (
            <Text style={styles.statusDescription}>
              Payment detected! Waiting for blockchain confirmation...
            </Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              {formatInvoiceAmount(invoice)}
            </Text>
          </View>

          {invoice.expected_token_amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected:</Text>
              <Text style={styles.detailValue}>
                {invoice.expected_token_amount} {invoice.token_symbol}
              </Text>
            </View>
          )}

          {invoice.merchant_address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text
                style={styles.detailValueSmall}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {invoice.merchant_address}
              </Text>
            </View>
          )}

          {invoice.transaction_hash && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction:</Text>
              <TouchableOpacity onPress={handleViewExplorer}>
                <Text
                  style={styles.linkText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {invoice.transaction_hash}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {invoice.payment_status === "PENDING_PAYMENT" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                processing && styles.buttonDisabled,
              ]}
              onPress={handleOpenWallet}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Open Wallet</Text>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCopyUri}
              >
                <Text style={styles.secondaryButtonText}>📋 Copy Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleShowQr}
              >
                <Text style={styles.secondaryButtonText}>🔲 Show QR</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => setShowReportModal(true)}
            >
              <Text style={styles.reportButtonText}>
                Report Payment Manually
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Having trouble?</Text>
          <Text style={styles.helpText}>
            • Make sure you're sending the correct amount (
            {invoice.expected_token_amount} {invoice.token_symbol})
          </Text>
          <Text style={styles.helpText}>
            • Double-check the recipient address matches
          </Text>
          <Text style={styles.helpText}>
            • If you sent from the wrong chain/token, contact support@wihngo.com
            with your transaction hash
          </Text>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            {invoice.merchant_address && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={
                    invoice.payment_method.startsWith("solana_")
                      ? buildSolanaPayUri(invoice)
                      : invoice.merchant_address
                  }
                  size={200}
                />
              </View>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Payment Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Payment</Text>
            <Text style={styles.modalDescription}>
              If you've already sent the payment, enter your transaction hash
              below:
            </Text>
            <TextInput
              style={styles.input}
              value={manualTxHash}
              onChangeText={setManualTxHash}
              placeholder="Transaction hash (0x... or base58)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowReportModal(false);
                  setManualTxHash("");
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  processing && styles.buttonDisabled,
                ]}
                onPress={handleReportPayment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  statusCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
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
  detailValueSmall: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    maxWidth: 200,
  },
  linkText: {
    fontSize: 12,
    color: "#007AFF",
    textDecorationLine: "underline",
    maxWidth: 200,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  reportButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  reportButtonText: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    opacity: 0.5,
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
  helpCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: "#1E40AF",
    marginBottom: 4,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#000",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
