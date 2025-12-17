/**
 * OfflineBanner Component
 * Displays a banner at the top of the screen when the device is offline
 */

import { useNetwork } from "@/contexts/network-context";
import Feather from "@expo/vector-icons/Feather";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OfflineBannerProps {
  /** Custom message to display when offline */
  message?: string;
}

export default function OfflineBanner({ message }: OfflineBannerProps) {
  const { t } = useTranslation();
  const { isOffline, isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const wasOffline = useRef(false);
  const [showConnected, setShowConnected] = React.useState(false);

  useEffect(() => {
    if (isOffline) {
      // Slide in when offline
      wasOffline.current = true;
      setShowConnected(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else if (wasOffline.current) {
      // Show connected state briefly before sliding out
      setShowConnected(true);

      // Wait 1 second to show the "connected" message, then slide out
      const timeout = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          wasOffline.current = false;
          setShowConnected(false);
        });
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isOffline, slideAnim]);

  // Don't render if we've never been offline
  if (!isOffline && !wasOffline.current) {
    return null;
  }

  const displayMessage = showConnected
    ? t("network.connectionRestored")
    : message || t("network.offline");

  const backgroundColor = showConnected ? "#22C55E" : "#EF4444"; // Green when connected, red when offline
  const iconName = showConnected ? "wifi" : "wifi-off";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY: slideAnim }],
          backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        <Feather name={iconName} size={18} color="#FFFFFF" />
        <Text style={styles.text}>{displayMessage}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
