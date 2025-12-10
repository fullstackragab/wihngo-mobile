/**
 * Notification Context
 * Manages in-app notifications for user feedback and important messages
 */

import { Notification } from "@/types/notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: Notification["type"],
    title: string,
    message: string,
    relatedId?: string
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@wihngo_notifications";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const saveNotifications = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }, [notifications]);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, []);

  // Load notifications from storage on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Save notifications to storage whenever they change
  useEffect(() => {
    saveNotifications();
  }, [saveNotifications]);

  const addNotification = (
    type: Notification["type"],
    title: string,
    message: string,
    relatedId?: string
  ) => {
    const newNotification: Notification = {
      notificationId: Date.now().toString(),
      userId: "local", // This will be set by the backend for real notifications
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.notificationId !== notificationId)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}
