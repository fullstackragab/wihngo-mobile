/**
 * Memorial Badge Component
 * Displays "In Loving Memory" badge for deceased birds
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MemorialBadgeProps {
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
  style?: any;
}

export default function MemorialBadge({
  size = "medium",
  showIcon = true,
  style,
}: MemorialBadgeProps) {
  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
      iconSize: 12,
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
      iconSize: 16,
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
      iconSize: 20,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.badge, currentSize.container, style]}>
      {showIcon && (
        <Ionicons name="heart" size={currentSize.iconSize} color="#fff" />
      )}
      <Text style={[styles.text, currentSize.text]}>In Loving Memory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(149, 165, 166, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  smallText: {
    fontSize: 10,
  },
  mediumContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mediumText: {
    fontSize: 12,
  },
  largeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  largeText: {
    fontSize: 14,
  },
});
