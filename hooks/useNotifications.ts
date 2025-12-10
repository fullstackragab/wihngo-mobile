/**
 * useNotifications Hook
 * Manages notification state and operations
 */

import { notificationService } from "@/services/notification.service";
import { pushNotificationService } from "@/services/push-notification.service";
import { Notification } from "@/types/notification";
import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  /**
   * Load notifications
   */
  const loadNotifications = useCallback(
    async (pageNum: number = 1, isRefreshing: boolean = false) => {
      try {
        if (isRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await notificationService.getNotifications(
          pageNum,
          20
        );

        if (pageNum === 1) {
          setNotifications(response.notifications);
        } else {
          setNotifications((prev) => [...prev, ...response.notifications]);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err: any) {
        console.error("Error loading notifications:", err);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /**
   * Load unread count
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);

      // Update app badge
      await pushNotificationService.setBadgeCount(count);
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await pushNotificationService.setBadgeCount(
          Math.max(0, unreadCount - 1)
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [unreadCount]
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await pushNotificationService.clearBadge();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);

        // Update local state
        const notification = notifications.find(
          (n) => n.notificationId === notificationId
        );
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId)
        );

        // Update unread count if notification was unread
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
          await pushNotificationService.setBadgeCount(
            Math.max(0, unreadCount - 1)
          );
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [notifications, unreadCount]
  );

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadNotifications(1, true);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  /**
   * Load more notifications
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  }, [loading, hasMore, page, loadNotifications]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadNotifications(1);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  /**
   * Set up polling for unread count (every 60 seconds)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
  };
}
