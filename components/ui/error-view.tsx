/**
 * ErrorView Component
 * Reusable error display with retry functionality
 */

import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  style?: ViewStyle;
}

export default function ErrorView({
  message,
  onRetry,
  retryButtonText,
  style,
}: ErrorViewProps) {
  const { t } = useTranslation();

  const defaultMessage = message || t("messages.somethingWentWrong");
  const defaultRetryText = retryButtonText || t("messages.tryAgain");

  return (
    <View style={[styles.container, style]}>
      <Feather name="alert-circle" size={64} color="#EF4444" />
      <Text style={styles.errorText}>{defaultMessage}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Feather name="refresh-cw" size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{defaultRetryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    fontSize: Typography.body,
    color: "#666666",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ECDC4",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.body,
    fontWeight: "600",
  },
});
