/**
 * NotificationCenter Component
 * Displays user's notifications in a modal with actions
 */

import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notification";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  visible,
  onClose,
}: NotificationCenterProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
  } = useNotifications();

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    // Close modal
    onClose();

    // Navigate to related content
    if (notification.relatedId) {
      switch (notification.type) {
        case "love":
        case "support":
          router.push(`/birds/${notification.relatedId}`);
          break;
        case "story":
          router.push(`/story/${notification.relatedId}`);
          break;
        case "comment":
          // TODO: Navigate to comment
          router.push(`/birds/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "love":
        return "heart";
      case "support":
        return "gift";
      case "comment":
        return "message-circle";
      case "story":
        return "book-open";
      case "recommendation":
        return "star";
      default:
        return "bell";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "love":
        return "#ef4444";
      case "support":
        return "#10b981";
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + "20" },
        ]}
      >
        <Feather
          name={getNotificationIcon(item.type)}
          size={20}
          color={getNotificationColor(item.type)}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>

        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.notificationId)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="x" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        You&apos;ll see updates about your birds here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || notifications.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4ECDC4" />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.headerButton}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.notificationId}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  unreadItem: {
    backgroundColor: "#f0fdfa",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
  },
  deleteButton: {
    padding: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ECDC4",
    position: "absolute",
    top: 20,
    right: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
