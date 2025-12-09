import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function NotificationsSettings() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newStories, setNewStories] = useState(true);
  const [birdUpdates, setBirdUpdates] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(false);
  const [supportUpdates, setSupportUpdates] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications on your device
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications via email
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Updates</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>New Stories</Text>
            <Text style={styles.settingDescription}>
              Notify when new stories are posted
            </Text>
          </View>
          <Switch value={newStories} onValueChange={setNewStories} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Bird Updates</Text>
            <Text style={styles.settingDescription}>
              Updates about your loved birds
            </Text>
          </View>
          <Switch value={birdUpdates} onValueChange={setBirdUpdates} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Support Updates</Text>
            <Text style={styles.settingDescription}>
              Updates on birds you support
            </Text>
          </View>
          <Switch value={supportUpdates} onValueChange={setSupportUpdates} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Community Activity</Text>
            <Text style={styles.settingDescription}>
              Updates about community discussions
            </Text>
          </View>
          <Switch
            value={communityActivity}
            onValueChange={setCommunityActivity}
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
});
