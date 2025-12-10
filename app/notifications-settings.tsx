import { useNotifications } from "@/contexts/notification-context";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { notificationService } from "@/services/notification.service";
import { pushNotificationService } from "@/services/push-notification.service";
import React from "react";
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

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      // Test notification sent - no alert needed
    } catch (error) {
      addNotification(
        "recommendation",
        "Test Failed",
        "Failed to send test notification"
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
        "Permission Denied",
        "Please enable notifications in your device settings"
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
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
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, styles.permissionButton]}
          onPress={handleRequestPermission}
          disabled={saving}
        >
          <Text style={styles.testButtonText}>Request Push Permissions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications via email
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
        <Text style={styles.sectionTitle}>Engagement</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Love Notifications</Text>
            <Text style={styles.settingDescription}>
              When someone loves your bird
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
            <Text style={styles.settingTitle}>Support Notifications</Text>
            <Text style={styles.settingDescription}>
              When someone supports your bird
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
            <Text style={styles.settingTitle}>Comment Notifications</Text>
            <Text style={styles.settingDescription}>
              When someone comments on your content
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
        <Text style={styles.sectionTitle}>Content Updates</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Story Notifications</Text>
            <Text style={styles.settingDescription}>
              New stories from birds you follow
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
            <Text style={styles.settingTitle}>Bird Update Notifications</Text>
            <Text style={styles.settingDescription}>
              Updates about your loved birds
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
        <Text style={styles.sectionTitle}>System</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>System Notifications</Text>
            <Text style={styles.settingDescription}>
              Important system announcements
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
        <Text style={styles.sectionTitle}>Recommendations</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              Recommendation Notifications
            </Text>
            <Text style={styles.settingDescription}>
              Suggested birds and content
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
