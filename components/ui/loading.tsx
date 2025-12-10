import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function Loading({
  message = "Loading...",
  size = "large",
  color = "#4ECDC4",
  fullScreen = false,
  style,
}: LoadingProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function EmptyState({
  icon = "inbox",
  title,
  message,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.emptyState, style]}>
      <View style={styles.emptyIconContainer}>
        <FontAwesome6 name={icon as any} size={56} color="#4ECDC4" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {action && (
        <TouchableOpacity style={styles.emptyAction} onPress={action.onPress}>
          <Text style={styles.emptyActionText}>{action.label}</Text>
          <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 15,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
