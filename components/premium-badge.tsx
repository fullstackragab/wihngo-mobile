import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PremiumBadgeProps = {
  size?: "small" | "medium" | "large";
};

export function PremiumBadge({ size = "medium" }: PremiumBadgeProps) {
  const sizeStyles = {
    small: { iconSize: 12, fontSize: 10, padding: 4 },
    medium: { iconSize: 14, fontSize: 12, padding: 6 },
    large: { iconSize: 16, fontSize: 14, padding: 8 },
  };

  const style = sizeStyles[size];

  return (
    <View style={[styles.container, { padding: style.padding }]}>
      <Ionicons name="star" size={style.iconSize} color="#fff" />
      <Text style={[styles.text, { fontSize: style.fontSize }]}>PREMIUM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});
