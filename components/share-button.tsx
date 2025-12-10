/**
 * ShareButton Component
 * Reusable button for sharing content with automatic error handling
 */

import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ShareButtonProps {
  title: string;
  message: string;
  url?: string;
  onShareSuccess?: () => void;
  onShareDismissed?: () => void;
  variant?: "icon" | "button" | "text";
  style?: ViewStyle;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}

export default function ShareButton({
  title,
  message,
  url,
  onShareSuccess,
  onShareDismissed,
  variant = "icon",
  style,
  iconSize = 24,
  iconColor = "black",
  disabled = false,
}: ShareButtonProps) {
  const handleShare = async () => {
    try {
      const shareContent: any = {
        message,
        title,
      };

      if (url) {
        shareContent.url = url;
      }

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
        if (onShareDismissed) {
          onShareDismissed();
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share. Please try again.");
    }
  };

  if (variant === "icon") {
    return (
      <TouchableOpacity
        onPress={handleShare}
        disabled={disabled}
        style={[styles.iconButton, style]}
      >
        <Feather name="share" size={iconSize} color={iconColor} />
      </TouchableOpacity>
    );
  }

  if (variant === "text") {
    return (
      <TouchableOpacity
        onPress={handleShare}
        disabled={disabled}
        style={[styles.textButton, style]}
      >
        <Feather name="share-2" size={16} color="#007AFF" />
        <Text style={styles.textButtonLabel}>Share</Text>
      </TouchableOpacity>
    );
  }

  // Button variant (default)
  return (
    <TouchableOpacity
      onPress={handleShare}
      disabled={disabled}
      style={[styles.button, style]}
    >
      <Feather name="share-2" size={18} color="#fff" />
      <Text style={styles.buttonText}>Share</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  textButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  textButtonLabel: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
