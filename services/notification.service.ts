/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { Notification, NotificationPreferences } from "@/types/notification";
import Constants from "expo-constants";
import { apiHelper } from "./api-helper";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export const notificationService = {
  /**
   * Get user's notifications (paginated)
   */
  async getNotifications(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await apiHelper.get(
        `${API_URL}notifications?page=${page}&pageSize=${pageSize}`
      );
      return response as {
        notifications: Notification[];
        total: number;
        hasMore: boolean;
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiHelper.get(
        `${API_URL}notifications/unread-count`
      );
      return (response as { count: number }).count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}notifications/mark-read`, {
        notificationId,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}notifications/mark-all-read`, {});
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiHelper.delete(`${API_URL}notifications/${notificationId}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * Get user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiHelper.get(
        `${API_URL}notifications/preferences`
      );
      return response as NotificationPreferences;
    } catch (error) {
      console.error("Error fetching preferences:", error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiHelper.put(
        `${API_URL}notifications/preferences`,
        preferences
      );
      return response as NotificationPreferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  },

  /**
   * Register device for push notifications
   */
  async registerDevice(
    deviceToken: string,
    deviceType: "ios" | "android" | "web",
    deviceName?: string
  ): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}notifications/register-device`, {
        deviceToken,
        deviceType,
        deviceName,
      });
    } catch (error) {
      console.error("Error registering device:", error);
      throw error;
    }
  },

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(deviceToken: string): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}notifications/unregister-device`, {
        deviceToken,
      });
    } catch (error) {
      console.error("Error unregistering device:", error);
      throw error;
    }
  },

  /**
   * Send test notification (for testing)
   */
  async sendTestNotification(): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}notifications/test`, {});
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  },
};
