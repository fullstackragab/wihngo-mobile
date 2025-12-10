/**
 * NotificationBell Component
 * Bell icon with badge showing unread count
 * Opens notification center when tapped
 */

import NotificationCenter from "@/components/notification-center";
import { useNotifications } from "@/hooks/useNotifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NotificationBellProps {
  iconSize?: number;
  iconColor?: string;
}

export function NotificationBell({
  iconSize = 24,
  iconColor = "#1f2937",
}: NotificationBellProps) {
  const [showCenter, setShowCenter] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowCenter(true)}
        style={styles.container}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={unreadCount > 0 ? "notifications" : "notifications-outline"}
          size={iconSize}
          color={iconColor}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationCenter
        visible={showCenter}
        onClose={() => setShowCenter(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});

// Also export as default for backward compatibility
export default NotificationBell;
