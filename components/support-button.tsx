/**
 * SupportButton Component
 * Reusable button for supporting birds with modal integration
 * Handles activity status to show/hide support based on bird activity
 */

import { BirdActivityStatus } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
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
  // Activity status props
  activityStatus?: BirdActivityStatus;
  canSupport?: boolean;
  supportUnavailableMessage?: string;
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
  activityStatus,
  canSupport = true,
  supportUnavailableMessage,
}: SupportButtonProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  // Determine if support should be available based on activity status
  const isSupportAvailable = canSupport && !isMemorial && activityStatus !== 'Inactive' && activityStatus !== 'Memorial';

  const handlePress = () => {
    if (!isSupportAvailable) {
      // Support not available - don't open modal
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

  // If support is not available (inactive or memorial), show unavailable state
  if (!isSupportAvailable && !isPlatformSupport) {
    return (
      <View style={[styles.unavailableContainer, style]}>
        <View style={styles.unavailableButton}>
          <FontAwesome6 name="hand-holding-heart" size={16} color="#9CA3AF" />
          <Text style={styles.unavailableText}>
            {supportUnavailableMessage || t("birdProfile.supportUnavailable")}
          </Text>
        </View>
      </View>
    );
  }

  if (variant === "solid") {
    return (
      <>
        <TouchableOpacity
          style={[styles.solidButton, style]}
          onPress={handlePress}
          disabled={disabled || !isSupportAvailable}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="hand-holding-heart" size={18} color="#fff" />
          <Text style={styles.solidButtonText}>{t("birdProfile.support")}</Text>
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
        disabled={disabled || !isSupportAvailable}
      >
        <LinearGradient
          colors={["#10b981", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <MaterialCommunityIcons name="corn" size={20} color="white" />
          <Text style={styles.gradientButtonText}>{t("birdProfile.support")}</Text>
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
  unavailableContainer: {
    flex: 1,
  },
  unavailableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unavailableText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
