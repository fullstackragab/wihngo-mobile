/**
 * Payment Result Screen
 * Shows final payment status and receipt download
 */

import {
  formatInvoiceAmount,
  getStatusDisplayText,
} from "@/services/donation.service";
import { downloadReceipt, getInvoice } from "@/services/invoice.service";
import { getExplorerUrl } from "@/services/wallet.service";
import type { Invoice } from "@/types/invoice";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ invoiceId: string; birdName?: string; birdId?: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = await getInvoice(params.invoiceId);
      setInvoice(invoiceData);
    } catch (error) {
      console.error("Error loading invoice:", error);
      Alert.alert("Error", "Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!invoice?.issued_pdf_url || !invoice.invoice_number) {
      Alert.alert("Not Available", "Receipt is not yet available for download");
      return;
    }

    try {
      setDownloading(true);
      await downloadReceipt(invoice.id, invoice.invoice_number);
      Alert.alert("Success", "Receipt downloaded successfully!");
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      Alert.alert("Error", error.message || "Failed to download receipt");
    } finally {
      setDownloading(false);
    }
  };

  const handleViewExplorer = () => {
    if (!invoice?.transaction_hash || !invoice?.network) return;
    const url = getExplorerUrl(invoice.transaction_hash, invoice.network);
    Linking.openURL(url);
  };

  const handleDone = () => {
    router.replace("/(tabs)/home");
  };

  const handleViewHistory = () => {
    router.push("/donation/history");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.buttonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusDisplay = getStatusDisplayText(invoice.payment_status);
  const isSuccess = invoice.payment_status === "CONFIRMED";
  const isFailed =
    invoice.payment_status === "FAILED" ||
    invoice.payment_status === "EXPIRED" ||
    invoice.payment_status === "CANCELLED";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Result Icon */}
        <View style={styles.iconContainer}>
          {isSuccess && <Text style={styles.successIcon}>❤️</Text>}
          {isFailed && <Text style={styles.failureIcon}>✕</Text>}
        </View>

        {/* Status Title */}
        <Text style={styles.statusTitle}>
          {isSuccess && t("checkout.sent")}
          {isFailed && "Payment " + statusDisplay.text}
        </Text>

        <Text style={styles.statusSubtitle}>
          {isSuccess && t("checkout.onItsWay", {
            amount: formatInvoiceAmount(invoice),
            birdName: params.birdName || t("checkout.theBird")
          })}
          {isFailed && t("checkout.paymentFailed")}
        </Text>

        {/* Legal Notice */}
        {isSuccess && (
          <View style={styles.legalNotice}>
            <Text style={styles.legalText}>
              📄{" "}
              <Text style={styles.legalBold}>Not a charitable donation:</Text>{" "}
              Wihngo is a for-profit company. This payment is not tax deductible
              unless explicitly stated otherwise.
            </Text>
          </View>
        )}

        {/* Invoice Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Transaction Details</Text>

          {invoice.invoice_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice #:</Text>
              <Text style={styles.detailValue}>{invoice.invoice_number}</Text>
            </View>
          )}

          {invoice.invoice_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(invoice.invoice_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValueBold}>
              {formatInvoiceAmount(invoice)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {getPaymentMethodName(invoice.payment_method)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusDisplay.color + "20" },
              ]}
            >
              <Text
                style={[styles.statusBadgeText, { color: statusDisplay.color }]}
              >
                {statusDisplay.text}
              </Text>
            </View>
          </View>

          {invoice.transaction_hash && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction:</Text>
              <TouchableOpacity onPress={handleViewExplorer}>
                <Text
                  style={styles.linkText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  View on Explorer →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Receipt Download */}
        {isSuccess && invoice.issued_pdf_url && (
          <TouchableOpacity
            style={[
              styles.downloadButton,
              downloading && styles.buttonDisabled,
            ]}
            onPress={handleDownloadReceipt}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.downloadButtonIcon}>📄</Text>
                <Text style={styles.downloadButtonText}>Download Receipt</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isSuccess && !invoice.issued_pdf_url && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              ⏳ Your receipt is being generated. You'll receive a notification
              when it's ready, and you can download it from your transaction
              history.
            </Text>
          </View>
        )}

        {/* Help Text */}
        {isSuccess && (
          <View style={styles.helpCard}>
            <Text style={styles.helpText}>
              💡 If you need an invoice with specific company details for
              accounting, update your profile or contact support@wihngo.com
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {isSuccess ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (params.birdId) {
                router.replace(`/bird/${params.birdId}` as any);
              } else {
                handleDone();
              }
            }}
          >
            <Text style={styles.primaryButtonText}>
              {params.birdName
                ? t("checkout.backToBird", { birdName: params.birdName })
                : t("common.done")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.secondaryButtonText}>{t("payout.viewHistory")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
              <Text style={styles.primaryButtonText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Support Contact */}
        {isFailed && (
          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>
              If you've already sent the payment and it's showing as failed,
              please contact us:
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:support@wihngo.com")}
            >
              <Text style={styles.supportEmail}>support@wihngo.com</Text>
            </TouchableOpacity>
            {invoice.transaction_hash && (
              <Text style={styles.supportHint}>
                Include your transaction hash:{" "}
                {invoice.transaction_hash.slice(0, 20)}...
              </Text>
            )}
          </View>
        )}
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
  iconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 64,
    color: "#10B981",
    fontWeight: "bold",
  },
  failureIcon: {
    fontSize: 64,
    color: "#EF4444",
    fontWeight: "bold",
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  ownerNotice: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
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
    alignItems: "center",
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
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  downloadButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoCard: {
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  helpCard: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  helpText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
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
  supportCard: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: "#991B1B",
    marginBottom: 8,
    lineHeight: 20,
  },
  supportEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  supportHint: {
    fontSize: 12,
    color: "#991B1B",
    fontStyle: "italic",
  },
});
