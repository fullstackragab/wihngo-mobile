/**
 * ErrorView Component
 * Reusable error display with retry functionality
 */

import Feather from "@expo/vector-icons/Feather";
import React from "react";
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
  message = "Something went wrong",
  onRetry,
  retryButtonText = "Try Again",
  style,
}: ErrorViewProps) {
  return (
    <View style={[styles.container, style]}>
      <Feather name="alert-circle" size={64} color="#ef4444" />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Feather name="refresh-cw" size={18} color="#fff" />
          <Text style={styles.retryButtonText}>{retryButtonText}</Text>
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
    backgroundColor: "#fff",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
