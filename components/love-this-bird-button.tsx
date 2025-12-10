/**
 * LoveThisBirdButton Component
 * Reusable button for loving/unloving birds with automatic state management
 */

import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { birdService } from "@/services/bird.service";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface LoveThisBirdButtonProps {
  birdId: string;
  initialIsLoved?: boolean;
  initialLoveCount?: number;
  onLoveChange?: (isLoved: boolean, newCount: number) => void;
  variant?: "gradient" | "pill";
  style?: ViewStyle;
  disabled?: boolean;
}

export default function LoveThisBirdButton({
  birdId,
  initialIsLoved = false,
  initialLoveCount = 0,
  onLoveChange,
  variant = "gradient",
  style,
  disabled = false,
}: LoveThisBirdButtonProps) {
  const [isLoved, setIsLoved] = useState(initialIsLoved);
  const [loveCount, setLoveCount] = useState(initialLoveCount);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  // Update state when props change
  useEffect(() => {
    setIsLoved(initialIsLoved);
  }, [initialIsLoved]);

  useEffect(() => {
    setLoveCount(initialLoveCount);
  }, [initialLoveCount]);

  const handleToggleLove = async () => {
    if (isLoading || disabled) return;

    const previousIsLoved = isLoved;
    const previousCount = loveCount;

    // Optimistic update
    setIsLoved(!isLoved);
    setLoveCount(isLoved ? Math.max(0, loveCount - 1) : loveCount + 1);

    try {
      setIsLoading(true);

      if (isLoved) {
        await birdService.unloveBird(birdId);
      } else {
        await birdService.loveBird(birdId);
      }

      // Notify parent component
      if (onLoveChange) {
        onLoveChange(
          !previousIsLoved,
          isLoved ? previousCount - 1 : previousCount + 1
        );
      }
    } catch (error) {
      // Revert on error
      setIsLoved(previousIsLoved);
      setLoveCount(previousCount);

      console.error("Error toggling love:", error);

      // Handle session expiry
      if (error instanceof Error && error.message.includes("Session expired")) {
        await logout();
        router.replace("/welcome");
        return;
      }

      addNotification(
        "recommendation",
        "Love Status Error",
        "Failed to update love status. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "pill") {
    return (
      <TouchableOpacity
        style={[styles.pillButton, isLoved && styles.pillButtonActive, style]}
        onPress={handleToggleLove}
        disabled={isLoading || disabled}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <>
            <Ionicons
              name={isLoved ? "heart" : "heart-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.pillButtonText}>
              {isLoved ? "Loved" : "Love This Bird"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Gradient variant
  return (
    <TouchableOpacity
      style={[styles.gradientButtonWrapper, style]}
      onPress={handleToggleLove}
      activeOpacity={0.8}
      disabled={isLoading || disabled}
    >
      <LinearGradient
        colors={isLoved ? ["#dc2626", "#b91c1c"] : ["#f43f5e", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Feather name="heart" size={20} color="white" />
            <Text style={styles.gradientButtonText}>
              {isLoved ? "Loved ❤️" : "Love This Bird"}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: "600",
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f43f5e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    minHeight: 44,
  },
  pillButtonActive: {
    backgroundColor: "#dc2626",
  },
  pillButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
