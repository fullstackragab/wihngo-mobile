import React, { ReactNode } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

interface CardProps extends TouchableOpacityProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = 16,
  style,
  onPress,
  ...props
}: CardProps) {
  const cardStyle = [
    styles.card,
    { padding },
    variant === "elevated" && styles.elevated,
    variant === "outlined" && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
