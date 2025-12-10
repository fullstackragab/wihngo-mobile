/**
 * LoadingScreen Component
 * Reusable loading screen with customizable message
 */

import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

interface LoadingScreenProps {
  message?: string;
  color?: string;
  size?: "small" | "large";
  style?: ViewStyle;
}

export default function LoadingScreen({
  message = "Loading...",
  color = "#0000ff",
  size = "large",
  style,
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});
