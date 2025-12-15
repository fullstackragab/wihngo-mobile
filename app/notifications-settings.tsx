import { useNotifications } from "@/contexts/notification-context";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { notificationService } from "@/services/notification.service";
import { pushNotificationService } from "@/services/push-notification.service";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsSettings() {
  const { preferences, loading, saving, updatePreference } =
    useNotificationPreferences();
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      // Test notification sent - no alert needed
    } catch (error) {
      addNotification(
        "recommendation",
        t("auth.testFailed"),
        t("auth.failedToSendTest")
      );
    }
  };

  const handleRequestPermission = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      // Permissions granted - no alert needed
      await pushNotificationService.initialize();
    } else {
      addNotification(
        "recommendation",
        t("auth.permissionDenied"),
        t("auth.enableNotifications")
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("auth.loadingPreferences")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Test Notification Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
          disabled={saving}
        >
          <Text style={styles.testButtonText}>
            {t("notificationSettings.sendTest")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, styles.permissionButton]}
          onPress={handleRequestPermission}
          disabled={saving}
        >
          <Text style={styles.testButtonText}>
            {t("notificationSettings.requestPermissions")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("notificationSettings.general")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.emailNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.emailNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.emailNotifications}
            onValueChange={(value) =>
              updatePreference("emailNotifications", value)
            }
            disabled={saving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("notificationSettings.engagement")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.loveNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.loveNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.loveNotifications}
            onValueChange={(value) =>
              updatePreference("loveNotifications", value)
            }
            disabled={saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.supportNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.supportNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.supportNotifications}
            onValueChange={(value) =>
              updatePreference("supportNotifications", value)
            }
            disabled={saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.commentNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.commentNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.commentNotifications}
            onValueChange={(value) =>
              updatePreference("commentNotifications", value)
            }
            disabled={saving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("notificationSettings.contentUpdates")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.storyNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.storyNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.storyNotifications}
            onValueChange={(value) =>
              updatePreference("storyNotifications", value)
            }
            disabled={saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.birdUpdateNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.birdUpdateNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.birdUpdateNotifications}
            onValueChange={(value) =>
              updatePreference("birdUpdateNotifications", value)
            }
            disabled={saving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("notificationSettings.system")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.systemNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.systemNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.systemNotifications}
            onValueChange={(value) =>
              updatePreference("systemNotifications", value)
            }
            disabled={saving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("notificationSettings.recommendations")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("notificationSettings.recommendationNotifications")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("notificationSettings.recommendationNotificationsDesc")}
            </Text>
          </View>
          <Switch
            value={preferences.recommendationNotifications}
            onValueChange={(value) =>
              updatePreference("recommendationNotifications", value)
            }
            disabled={saving}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  testButton: {
    backgroundColor: "#4ECDC4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: "#FF6B6B",
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
