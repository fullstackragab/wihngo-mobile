/**
 * Phantom Payment Method Selector
 * Allows users to choose between manual wallet transfer and Phantom wallet payment
 */

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";

export type PaymentMethodType = "manual" | "phantom";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  isPhantomAvailable: boolean;
  checkingPhantom: boolean;
  disabled?: boolean;
}

export function PhantomPaymentSelector({
  selectedMethod,
  onSelectMethod,
  isPhantomAvailable,
  checkingPhantom,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t("donation.selectPaymentMethod", "How would you like to pay?")}
      </Text>
      <Text style={styles.subtitle}>
        {t(
          "donation.selectPaymentMethodDescription",
          "Choose your preferred payment method"
        )}
      </Text>

      {/* Manual Transfer Option */}
      <TouchableOpacity
        style={[
          styles.optionCard,
          selectedMethod === "manual" && styles.optionCardSelected,
          disabled && styles.optionCardDisabled,
        ]}
        onPress={() => onSelectMethod("manual")}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.optionHeader}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📱</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text
              style={[
                styles.optionTitle,
                selectedMethod === "manual" && styles.optionTitleSelected,
              ]}
            >
              {t("donation.manualTransfer", "Send Manually to Wallet")}
            </Text>
            <Text style={styles.optionDescription}>
              {t(
                "donation.manualTransferDescription",
                "Copy the address and send from any wallet app"
              )}
            </Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === "manual" && styles.radioOuterSelected,
            ]}
          >
            {selectedMethod === "manual" && (
              <View style={styles.radioInner} />
            )}
          </View>
        </View>
        <View style={styles.optionFeatures}>
          <Text style={styles.featureText}>
            {t("donation.anyWalletApp", "Works with any Solana wallet")}
          </Text>
          <Text style={styles.featureText}>
            {t("donation.qrCodeAvailable", "QR code & copy address")}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Phantom Wallet Option */}
      <TouchableOpacity
        style={[
          styles.optionCard,
          selectedMethod === "phantom" && styles.optionCardSelected,
          (!isPhantomAvailable || disabled) && styles.optionCardDisabled,
        ]}
        onPress={() => isPhantomAvailable && onSelectMethod("phantom")}
        disabled={!isPhantomAvailable || disabled}
        activeOpacity={0.7}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.optionIconContainer, styles.phantomIconContainer]}>
            <Text style={styles.optionIcon}>👻</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <View style={styles.optionTitleRow}>
              <Text
                style={[
                  styles.optionTitle,
                  selectedMethod === "phantom" && styles.optionTitleSelected,
                  !isPhantomAvailable && styles.optionTitleDisabled,
                ]}
              >
                {t("donation.phantomWallet", "Pay with Phantom")}
              </Text>
              {checkingPhantom && (
                <ActivityIndicator
                  size="small"
                  color="#AB9FF2"
                  style={styles.checkingIndicator}
                />
              )}
            </View>
            <Text
              style={[
                styles.optionDescription,
                !isPhantomAvailable && styles.optionDescriptionDisabled,
              ]}
            >
              {isPhantomAvailable
                ? t(
                    "donation.phantomDescription",
                    "Approve payment directly in Phantom app"
                  )
                : t(
                    "donation.phantomNotInstalled",
                    "Install Phantom to use this option"
                  )}
            </Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === "phantom" && styles.radioOuterSelected,
              !isPhantomAvailable && styles.radioOuterDisabled,
            ]}
          >
            {selectedMethod === "phantom" && isPhantomAvailable && (
              <View style={styles.radioInner} />
            )}
          </View>
        </View>
        <View style={styles.optionFeatures}>
          <Text
            style={[
              styles.featureText,
              !isPhantomAvailable && styles.featureTextDisabled,
            ]}
          >
            {t("donation.oneClickPayment", "One-click payment approval")}
          </Text>
          <Text
            style={[
              styles.featureText,
              !isPhantomAvailable && styles.featureTextDisabled,
            ]}
          >
            {t("donation.secureConnection", "Secure wallet connection")}
          </Text>
        </View>

        {!isPhantomAvailable && !checkingPhantom && (
          <View style={styles.installBadge}>
            <Text style={styles.installBadgeText}>
              {t("donation.installPhantom", "Get Phantom")}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          {t(
            "donation.securityNote",
            "Both methods are secure. Your payment will be verified on the Solana blockchain."
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  optionCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  phantomIconContainer: {
    backgroundColor: "#AB9FF2",
  },
  optionIcon: {
    fontSize: 22,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: "#007AFF",
  },
  optionTitleDisabled: {
    color: "#9CA3AF",
  },
  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  optionDescriptionDisabled: {
    color: "#9CA3AF",
  },
  checkingIndicator: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: "#007AFF",
  },
  radioOuterDisabled: {
    borderColor: "#E5E7EB",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  optionFeatures: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureTextDisabled: {
    color: "#9CA3AF",
    backgroundColor: "#F9FAFB",
  },
  installBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#AB9FF2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  installBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
});

export default PhantomPaymentSelector;
