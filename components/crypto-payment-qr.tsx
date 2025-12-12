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
  children?: React.ReactNode;
};

export default function CryptoPaymentQR({
  payment,
  onExpired,
  children,
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

      {/* Simplified Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to Pay</Text>
        <View style={styles.instructionItem}>
          <FontAwesome6 name="wallet" size={20} color="#007AFF" />
          <Text style={styles.instructionText}>
            Send{" "}
            <Text style={styles.bold}>
              {formatCryptoAmount(payment.amountCrypto, payment.currency)}{" "}
              {payment.currency}
            </Text>{" "}
            (≈ ${payment.amountUsd.toFixed(2)}) or more to the address above
          </Text>
        </View>
        <View style={styles.feeInfoBox}>
          <FontAwesome6 name="circle-info" size={16} color="#FF9500" />
          <View style={styles.feeInfoContent}>
            <Text style={styles.feeInfoTitle}>Transaction Fees</Text>
            <Text style={styles.feeInfoText}>
              • Wihngo deducts 5% (minimum $1){"\n"}• Plus network fees (varies
              by blockchain){"\n"}• Minimum recommended:{" "}
              <Text style={styles.bold}>$10</Text>
            </Text>
            <Text style={styles.feeExample}>
              Example: Send $100 → Receive ~$94 ($5 Wihngo fee + $1 network fee)
            </Text>
          </View>
        </View>
      </View>

      {/* Automatic Detection Notice */}
      <View style={styles.autoDetectBox}>
        <FontAwesome6 name="magnifying-glass" size={16} color="#4CAF50" />
        <View style={styles.autoDetectContent}>
          <Text style={styles.autoDetectTitle}>
            ✨ Automatic Payment Detection
          </Text>
          <Text style={styles.autoDetectText}>
            Your payment will be detected automatically within 10-60 seconds. No
            transaction hash needed! Payment completes after{" "}
            {payment.requiredConfirmations} confirmations.
          </Text>
        </View>
      </View>

      {/* Payment Status */}
      {children}

      {/* Info Notice */}
      <View style={styles.infoBox}>
        <FontAwesome6 name="circle-info" size={16} color="#2196F3" />
        <Text style={styles.infoText}>
          This address is unique to your transaction. Any amount sent will be
          credited to your account.
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
  feeInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    marginTop: 12,
  },
  feeInfoContent: {
    flex: 1,
    gap: 6,
  },
  feeInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
  },
  feeInfoText: {
    fontSize: 12,
    color: "#E65100",
    lineHeight: 18,
  },
  feeExample: {
    fontSize: 12,
    color: "#E65100",
    fontStyle: "italic",
    marginTop: 4,
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
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#0D47A1",
  },
});
