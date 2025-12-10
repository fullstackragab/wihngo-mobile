import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[size] as ViewStyle];
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled || loading) baseStyle.push(styles.disabled);
    return baseStyle;
  };

  const renderContent = () => {
    const iconSize = size === "small" ? 16 : size === "large" ? 24 : 20;
    const textStyle: TextStyle[] = [
      styles.text,
      styles[`${size}Text` as keyof typeof styles] as TextStyle,
      styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    ];

    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#4ECDC4" : "#FFFFFF"
          }
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && iconPosition === "left" && (
          <FontAwesome6
            name={icon as any}
            size={iconSize}
            color={
              variant === "outline" || variant === "ghost"
                ? "#4ECDC4"
                : "#FFFFFF"
            }
            style={styles.iconLeft}
          />
        )}
        <Text style={textStyle}>{title}</Text>
        {icon && iconPosition === "right" && (
          <FontAwesome6
            name={icon as any}
            size={iconSize}
            color={
              variant === "outline" || variant === "ghost"
                ? "#4ECDC4"
                : "#FFFFFF"
            }
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        {...props}
        style={[getButtonStyle(), style]}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#4ECDC4", "#44A08D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle =
    variant === "secondary"
      ? styles.secondary
      : variant === "outline"
      ? styles.outline
      : variant === "ghost"
      ? styles.ghost
      : styles.danger;

  return (
    <TouchableOpacity
      {...props}
      style={[getButtonStyle(), variantStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: "#667EEA",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: "#EF4444",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#4ECDC4",
  },
  ghostText: {
    color: "#4ECDC4",
  },
  dangerText: {
    color: "#FFFFFF",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
