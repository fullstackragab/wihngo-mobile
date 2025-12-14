/**
 * Push Notification Service
 * Handles push notification registration, permissions, and event handling
 * Uses expo-notifications for cross-platform support
 */

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { notificationService } from "./notification.service";

// Expo Project ID from app config
const EXPO_PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.expoConfig?.extra?.projectId ||
  "1f8be543-8a9c-49dc-ae05-8e8161b36f4c";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface LocalNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
  };
}

export const pushNotificationService = {
  /**
   * Initialize push notifications
   * Call this on app startup
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("Push notification permission denied");
        return;
      }

      // Get push token
      const token = await this.getPushToken();
      if (token) {
        // Register device with backend (non-blocking)
        const deviceType = Platform.OS as "ios" | "android";
        const deviceName =
          Device.modelName || Device.osName || "Unknown Device";

        // Try to register, but don't fail if backend endpoint isn't ready
        try {
          await notificationService.registerDevice(
            token,
            deviceType,
            deviceName
          );
          console.log("Device registered for push notifications:", token);
        } catch (registerError: any) {
          // Log the error but don't throw - backend might not have this endpoint yet
          console.warn(
            "Could not register device with backend:",
            registerError?.message || registerError
          );
          console.log("Push token obtained:", token);
        }
      }

      // Set up notification listeners
      this.setupListeners();
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  },

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications require a physical device");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push notification permissions");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting push notification permission:", error);
      return false;
    }
  },

  /**
   * Get Expo push token
   */
  async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      });

      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  },

  /**
   * Set up notification listeners
   */
  setupListeners(): void {
    // Notification received while app is in foreground
    Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log("Notification received:", notification);
        // You can show a custom in-app notification here
      }
    );

    // Notification tapped by user
    Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content.data;

        // Handle deep linking based on notification data
        if (data.deepLink) {
          // TODO: Navigate to the deep link
          // Example: Linking.openURL(data.deepLink);
          console.log("Deep link:", data.deepLink);
        }
      }
    );
  },

  /**
   * Handle notification received (foreground)
   * @param callback Function to call when notification is received
   */
  onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Handle notification tapped
   * @param callback Function to call when notification is tapped
   */
  onNotificationTapped(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Schedule a local notification
   */
  async scheduleNotification(notification: LocalNotification): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: notification.trigger
          ? ({
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: notification.trigger.seconds || 1,
              repeats: notification.trigger.repeats || false,
            } as Notifications.TimeIntervalTriggerInput)
          : null,
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
      throw error;
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
      throw error;
    }
  },

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("Error getting badge count:", error);
      return 0;
    }
  },

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  },

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Error clearing badge:", error);
    }
  },

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error dismissing notifications:", error);
    }
  },
};
