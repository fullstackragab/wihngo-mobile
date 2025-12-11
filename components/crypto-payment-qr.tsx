/**
 * Crypto Payment QR Component
 * Displays payment address with QR code for crypto payments
 */

import {
  formatCryptoAmount,
  formatTimeRemaining,
  getNetworkName,
} from "@/services/crypto.service";
import { CryptoPaymentRequest } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type CryptoPaymentQRProps = {
  payment: CryptoPaymentRequest;
  onExpired?: () => void;
};

export default function CryptoPaymentQR({
  payment,
  onExpired,
}: CryptoPaymentQRProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log("🔍 CryptoPaymentQR mounted with payment:", {
      id: payment.id,
      expiresAt: payment.expiresAt,
      status: payment.status,
    });

    const updateTimer = () => {
      const remaining = formatTimeRemaining(payment.expiresAt);
      setTimeRemaining(remaining);

      if (remaining === "Expired" && onExpired) {
        console.log("⏰ Payment expired, calling onExpired callback");
        onExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      console.log("🧹 CryptoPaymentQR cleanup, clearing interval");
      clearInterval(interval);
    };
  }, [payment.expiresAt, onExpired]);

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    // Copied - user sees visual feedback
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <FontAwesome6 name="clock" size={16} color="#FF6B6B" />
        <Text style={styles.timerText}>
          Time remaining: <Text style={styles.timerValue}>{timeRemaining}</Text>
        </Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            value={payment.paymentUri}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
        <Text style={styles.qrLabel}>Scan to pay</Text>
      </View>

      {/* Payment Details */}
      <View style={styles.detailsContainer}>
        {/* Amount */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <View style={styles.detailValue}>
            <Text style={styles.cryptoAmount}>
              {formatCryptoAmount(payment.amountCrypto, payment.currency)}{" "}
              {payment.currency}
            </Text>
            <Text style={styles.usdAmount}>
              ≈ ${payment.amountUsd.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Network */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network</Text>
          <Text style={styles.detailValueText}>
            {getNetworkName(payment.network)}
          </Text>
        </View>

        {/* Wallet Address */}
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Text style={styles.detailLabel}>Payment Address</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(payment.walletAddress, "Address")}
              style={styles.copyButton}
            >
              <FontAwesome6
                name={copied ? "check" : "copy"}
                size={16}
                color="#007AFF"
              />
              <Text style={styles.copyButtonText}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText} numberOfLines={2}>
              {payment.walletAddress}
            </Text>
          </View>
        </View>

        {/* Confirmations Required */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Confirmations Required</Text>
          <Text style={styles.detailValueText}>
            {payment.requiredConfirmations}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Payment Instructions</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <FontAwesome6 name="1" size={16} color="#007AFF" />
            <Text style={styles.instructionText}>
              Send exactly{" "}
              <Text style={styles.bold}>
                {formatCryptoAmount(payment.amountCrypto, payment.currency)}{" "}
                {payment.currency}
              </Text>{" "}
              to the address above
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <FontAwesome6 name="2" size={16} color="#007AFF" />
            <Text style={styles.instructionText}>
              Wait for automatic detection (no transaction hash needed!)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <FontAwesome6 name="3" size={16} color="#007AFF" />
            <Text style={styles.instructionText}>
              Payment completes after {payment.requiredConfirmations}{" "}
              confirmations
            </Text>
          </View>
        </View>
      </View>

      {/* Automatic Detection Notice */}
      <View style={styles.autoDetectBox}>
        <FontAwesome6 name="magnifying-glass" size={16} color="#4CAF50" />
        <View style={styles.autoDetectContent}>
          <Text style={styles.autoDetectTitle}>
            🔍 Automatic Detection Active
          </Text>
          <Text style={styles.autoDetectText}>
            We're scanning the blockchain every 30 seconds. Your payment will be
            detected automatically within 10-60 seconds after sending.
          </Text>
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <FontAwesome6 name="triangle-exclamation" size={16} color="#FF9800" />
        <Text style={styles.warningText}>
          Sending a different amount may result in loss of funds
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  timerValue: {
    fontWeight: "600",
    color: "#FF6B6B",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  detailsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    alignItems: "flex-end",
  },
  cryptoAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  usdAmount: {
    fontSize: 12,
    color: "#666",
  },
  detailValueText: {
    fontSize: 14,
    color: "#333",
  },
  addressContainer: {
    gap: 8,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  addressBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addressText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
    color: "#333",
  },
  autoDetectBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    marginBottom: 16,
  },
  autoDetectContent: {
    flex: 1,
    gap: 4,
  },
  autoDetectTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  autoDetectText: {
    fontSize: 12,
    color: "#1B5E20",
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#E65100",
  },
});
