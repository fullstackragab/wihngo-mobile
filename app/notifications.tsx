/**
 * Notifications Screen
 * Displays all user notifications with filtering and actions
 */

import { useNotifications } from "@/contexts/notification-context";
import { Notification } from "@/types/notification";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "support":
        return "hand-holding-heart";
      case "love":
        return "heart";
      case "comment":
        return "comment";
      case "story":
        return "book";
      case "recommendation":
        return "star";
      default:
        return "bell";
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "support":
        return "#10b981";
      case "love":
        return "#ef4444";
      case "comment":
        return "#3b82f6";
      case "story":
        return "#8b5cf6";
      case "recommendation":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.notificationId);

    // Navigate to related content if available
    if (notification.relatedId) {
      if (notification.type === "story") {
        router.push(`/story/${notification.relatedId}`);
      } else if (
        notification.type === "support" ||
        notification.type === "love"
      ) {
        // Navigate to bird profile or similar
        // router.push(`/bird/${notification.relatedId}`);
      }
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: getIconColor(item.type) + "20" },
          ]}
        >
          <FontAwesome6
            name={getIcon(item.type)}
            size={20}
            color={getIconColor(item.type)}
            solid
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteNotification(item.notificationId);
        }}
      >
        <FontAwesome6 name="xmark" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="chevron-left" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter and Actions Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" && styles.activeFilter,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.activeFilterText,
              ]}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "unread" && styles.activeFilter,
            ]}
            onPress={() => setFilter("unread")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "unread" && styles.activeFilterText,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {notifications.length > 0 && (
          <View style={styles.actionsContainer}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={markAllAsRead}
              >
                <FontAwesome6 name="check-double" size={14} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearAll}
            >
              <FontAwesome6 name="trash" size={14} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.clearButtonText]}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="bell-slash" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            {filter === "unread"
              ? "You're all caught up!"
              : "You'll see notifications here when you receive them"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.notificationId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerRight: {
    width: 36,
  },
  actionBar: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  activeFilter: {
    backgroundColor: "#4ECDC4",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4ECDC4",
  },
  clearButton: {},
  clearButtonText: {
    color: "#ef4444",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#4ECDC4",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ECDC4",
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
