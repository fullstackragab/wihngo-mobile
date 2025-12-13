/**
 * Donation Push Notification Service
 * Handles push notifications for invoice/receipt events
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiHelper } from "./api-helper";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for donation/invoice push notifications
 */
export async function registerForDonationNotifications(): Promise<
  string | null
> {
  try {
    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    const expoPushToken = tokenData.data;

    // Register token with backend for donation notifications
    await apiHelper.post("/v1/notifications/register-donation-device", {
      expo_push_token: expoPushToken,
      platform: Platform.OS,
    });

    console.log("Registered for donation notifications:", expoPushToken);
    return expoPushToken;
  } catch (error) {
    console.error("Error registering for donation notifications:", error);
    return null;
  }
}

/**
 * Handle notification when app is in foreground
 */
export function addDonationNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Handle notification tap (when user taps notification)
 */
export function addDonationNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Show local notification (for testing or SSE events)
 */
export async function showLocalDonationNotification(
  title: string,
  body: string,
  data?: any
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Show immediately
  });
}
