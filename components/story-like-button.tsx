/**
 * StoryLikeButton Component
 * Reusable button for liking/unliking stories with optimistic UI updates
 */

import { useAuth } from "@/contexts/auth-context";
import { likeService } from "@/services/like.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface StoryLikeButtonProps {
  storyId: string;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
  variant?: "default" | "compact";
  style?: ViewStyle;
  disabled?: boolean;
  showCount?: boolean;
}

export default function StoryLikeButton({
  storyId,
  initialIsLiked = false,
  initialLikeCount = 0,
  onLikeChange,
  variant = "default",
  style,
  disabled = false,
  showCount = true,
}: StoryLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  // Update state when props change
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleToggleLike = async () => {
    if (isLoading || disabled) return;

    // Check if user is authenticated
    if (!user) {
      Alert.alert("Authentication Required", "Please sign in to like stories", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign In",
          onPress: () => router.push("/welcome"),
        },
      ]);
      return;
    }

    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? Math.max(0, likeCount - 1) : likeCount + 1);

    try {
      setIsLoading(true);

      const newIsLiked = await likeService.toggleStoryLike(storyId, isLiked);

      // Notify parent component
      if (onLikeChange) {
        onLikeChange(
          newIsLiked,
          isLiked ? previousCount - 1 : previousCount + 1
        );
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);

      console.error("Error toggling like:", error);

      // Handle session expiry
      if (error instanceof Error && error.message.includes("Session expired")) {
        await logout();
        router.replace("/welcome");
        return;
      }

      // Show user-friendly error
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update like status";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <TouchableOpacity
        onPress={handleToggleLike}
        disabled={isLoading || disabled}
        style={[styles.compactButton, style]}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FF6B9D" />
        ) : (
          <>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#FF6B9D" : "#666"}
            />
            {showCount && (
              <Text
                style={[
                  styles.compactCount,
                  isLiked && styles.compactCountLiked,
                ]}
              >
                {likeCount}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleToggleLike}
      disabled={isLoading || disabled}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FF6B9D" />
      ) : (
        <View style={styles.content}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#FF6B9D" : "#666"}
          />
          {showCount && (
            <Text style={[styles.count, isLiked && styles.countLiked]}>
              {likeCount}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    minWidth: 60,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  countLiked: {
    color: "#FF6B9D",
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  compactCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  compactCountLiked: {
    color: "#FF6B9D",
  },
});
