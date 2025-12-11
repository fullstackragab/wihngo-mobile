/**
 * Crypto Payment Status Component
 * Shows real-time status of a crypto payment transaction
 */

import {
  getPaymentStatusColor,
  getPaymentStatusIcon,
} from "@/services/crypto.service";
import { CryptoPaymentRequest } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type CryptoPaymentStatusProps = {
  payment: CryptoPaymentRequest;
  showDetails?: boolean;
};

export default function CryptoPaymentStatus({
  payment,
  showDetails = true,
}: CryptoPaymentStatusProps) {
  const statusColor = getPaymentStatusColor(payment.status);
  const statusIcon = getPaymentStatusIcon(payment.status);

  const getStatusMessage = () => {
    switch (payment.status) {
      case "pending":
        return "Waiting for payment...";
      case "confirming":
        return `Confirming transaction (${payment.confirmations}/${payment.requiredConfirmations})`;
      case "confirmed":
        return "Payment confirmed!";
      case "completed":
        return "Payment completed successfully!";
      case "expired":
        return "Payment window expired";
      case "cancelled":
        return "Payment cancelled";
      case "failed":
        return "Payment failed";
      default:
        return "Unknown status";
    }
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case "pending":
        return "#FFA500"; // Orange
      case "confirming":
        return "#3498db"; // Blue
      case "confirmed":
      case "completed":
        return "#27ae60"; // Green
      case "expired":
      case "failed":
        return "#e74c3c"; // Red
      case "cancelled":
        return "#95a5a6"; // Gray
      default:
        return "#666";
    }
  };

  const isProcessing =
    payment.status === "pending" || payment.status === "confirming";

  return (
    <View style={styles.container}>
      <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
        <View style={styles.statusHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getStatusColor() },
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <FontAwesome6 name={statusIcon as any} size={20} color="#fff" />
            )}
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{getStatusMessage()}</Text>
            <Text style={styles.statusSubtitle}>
              Status:{" "}
              <Text style={[styles.statusBadge, { color: getStatusColor() }]}>
                {payment.status.toUpperCase()}
              </Text>
            </Text>
          </View>
        </View>

        {showDetails && payment.status === "confirming" && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (payment.confirmations / payment.requiredConfirmations) *
                      100
                    }%`,
                    backgroundColor: getStatusColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Confirmations: {payment.confirmations} /{" "}
              {payment.requiredConfirmations}
            </Text>
          </View>
        )}

        {showDetails && payment.transactionHash && (
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction Hash:</Text>
            <Text style={styles.transactionHash} numberOfLines={1}>
              {payment.transactionHash}
            </Text>
          </View>
        )}
      </View>

      {showDetails && payment.status === "pending" && (
        <View style={styles.helpBox}>
          <FontAwesome6 name="circle-info" size={16} color="#007AFF" />
          <Text style={styles.helpText}>
            Send the exact amount to the address provided. The payment will be
            detected automatically once the transaction is broadcast.
          </Text>
        </View>
      )}

      {showDetails && payment.status === "confirming" && (
        <View style={styles.helpBox}>
          <FontAwesome6 name="circle-info" size={16} color="#007AFF" />
          <Text style={styles.helpText}>
            Your transaction is being confirmed on the blockchain. This usually
            takes a few minutes depending on network conditions.
          </Text>
        </View>
      )}

      {showDetails &&
        (payment.status === "confirmed" || payment.status === "completed") && (
          <View style={[styles.helpBox, styles.successBox]}>
            <FontAwesome6 name="circle-check" size={16} color="#28a745" />
            <Text style={[styles.helpText, styles.successText]}>
              Your payment has been successfully processed. Your premium
              features are now active!
            </Text>
          </View>
        )}

      {showDetails &&
        (payment.status === "expired" || payment.status === "failed") && (
          <View style={[styles.helpBox, styles.errorBox]}>
            <FontAwesome6 name="circle-exclamation" size={16} color="#dc3545" />
            <Text style={[styles.helpText, styles.errorText]}>
              {payment.status === "expired"
                ? "The payment window has expired. Please create a new payment request."
                : "The payment could not be processed. Please contact support if you believe this is an error."}
            </Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusInfo: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  statusBadge: {
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  transactionInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    gap: 4,
  },
  transactionLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  transactionHash: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#333",
  },
  helpBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: "#007AFF",
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: "#E8F5E9",
  },
  successText: {
    color: "#28a745",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: "#dc3545",
  },
});
