/**
 * SupportButton Component
 * Reusable button for supporting birds with modal integration
 */

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import SupportModal from "./support-modal";

interface SupportButtonProps {
  birdId?: string;
  birdName?: string;
  isPlatformSupport?: boolean;
  onSupportComplete?: () => void;
  variant?: "gradient" | "solid";
  style?: ViewStyle;
  disabled?: boolean;
  isMemorial?: boolean;
}

export default function SupportButton({
  birdId,
  birdName,
  isPlatformSupport = false,
  onSupportComplete,
  variant = "gradient",
  style,
  disabled = false,
  isMemorial = false,
}: SupportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    if (isMemorial) {
      Alert.alert(
        "Memorial Bird",
        "This bird is remembered with love. Support is no longer available."
      );
      return;
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    if (onSupportComplete) {
      onSupportComplete();
    }
  };

  if (variant === "solid") {
    return (
      <>
        <TouchableOpacity
          style={[styles.solidButton, style]}
          onPress={handlePress}
          disabled={disabled || isMemorial}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="hand-holding-heart" size={18} color="#fff" />
          <Text style={styles.solidButtonText}>Support</Text>
        </TouchableOpacity>

        <SupportModal
          visible={showModal}
          onClose={handleClose}
          birdId={birdId}
          birdName={birdName}
          isPlatformSupport={isPlatformSupport}
        />
      </>
    );
  }

  // Gradient variant (default)
  return (
    <>
      <TouchableOpacity
        style={[styles.gradientButtonWrapper, style]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled || isMemorial}
      >
        <LinearGradient
          colors={["#10b981", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <MaterialCommunityIcons name="corn" size={20} color="white" />
          <Text style={styles.gradientButtonText}>Support</Text>
        </LinearGradient>
      </TouchableOpacity>

      <SupportModal
        visible={showModal}
        onClose={handleClose}
        birdId={birdId}
        birdName={birdName}
        isPlatformSupport={isPlatformSupport}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gradientButtonWrapper: {
    width: "auto",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minHeight: 48,
  },
  gradientButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  solidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    minHeight: 44,
  },
  solidButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
