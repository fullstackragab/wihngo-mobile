/**
 * Donation Push Notification Service
 * Handles push notifications for invoice/receipt events
 */

import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiHelper } from "./api-helper";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Configure notification behavior
// Note: This has limited functionality in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Register device for donation/invoice push notifications
 */
export async function registerForDonationNotifications(): Promise<
  string | null
> {
  try {
    // Check if running in Expo Go
    if (isExpoGo) {
      console.log(
        "📱 Running in Expo Go - Donation notifications have limited functionality"
      );
    }

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
      projectId:
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.expoConfig?.extra?.projectId ||
        "1f8be543-8a9c-49dc-ae05-8e8161b36f4c",
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
