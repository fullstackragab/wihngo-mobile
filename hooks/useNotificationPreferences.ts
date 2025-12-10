/**
 * useNotificationPreferences Hook
 * Manages notification preferences state and operations
 */

import { notificationService } from "@/services/notification.service";
import { NotificationPreferences } from "@/types/notification";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  supportNotifications: true,
  loveNotifications: true,
  commentNotifications: true,
  storyNotifications: true,
  recommendationNotifications: true,
  emailNotifications: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load preferences from server
   */
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (err: any) {
      console.error("Error loading preferences:", err);
      setError(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    async (
      key: keyof NotificationPreferences,
      value: boolean
    ): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        // Optimistic update
        setPreferences((prev) => ({ ...prev, [key]: value }));

        // Save to server
        const updated = await notificationService.updatePreferences({
          [key]: value,
        });
        setPreferences(updated);

        return true;
      } catch (err: any) {
        console.error("Error updating preference:", err);
        setError(err.message || "Failed to update preference");

        // Revert on error
        setPreferences((prev) => ({
          ...prev,
          [key]: !value,
        }));

        Alert.alert("Error", "Failed to update notification settings");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [preferences]
  );

  /**
   * Update multiple preferences at once
   */
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>): Promise<boolean> => {
      // Save previous state for rollback
      const prevState = { ...preferences };
      try {
        setSaving(true);
        setError(null);

        // Optimistic update
        setPreferences((prev) => ({ ...prev, ...updates }));

        // Save to server
        const updated = await notificationService.updatePreferences(updates);
        setPreferences(updated);

        return true;
      } catch (err: any) {
        console.error("Error updating preferences:", err);
        setError(err.message || "Failed to update preferences");

        // Revert on error
        setPreferences(prevState);

        Alert.alert("Error", "Failed to update notification settings");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [preferences]
  );

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(async () => {
    return updatePreferences(DEFAULT_PREFERENCES);
  }, [updatePreferences]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    error,
    updatePreference,
    updatePreferences,
    resetToDefaults,
    reload: loadPreferences,
  };
}
