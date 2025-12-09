import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function PrivacySettings() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showBirds, setShowBirds] = useState(true);
  const [showStories, setShowStories] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Public Profile</Text>
            <Text style={styles.settingDescription}>
              Make your profile visible to everyone
            </Text>
          </View>
          <Switch value={profilePublic} onValueChange={setProfilePublic} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Email</Text>
            <Text style={styles.settingDescription}>
              Display your email on your profile
            </Text>
          </View>
          <Switch value={showEmail} onValueChange={setShowEmail} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show My Birds</Text>
            <Text style={styles.settingDescription}>
              Let others see your bird collection
            </Text>
          </View>
          <Switch value={showBirds} onValueChange={setShowBirds} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show My Stories</Text>
            <Text style={styles.settingDescription}>
              Let others see your posted stories
            </Text>
          </View>
          <Switch value={showStories} onValueChange={setShowStories} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Allow Messages</Text>
            <Text style={styles.settingDescription}>
              Let other users send you messages
            </Text>
          </View>
          <Switch value={allowMessages} onValueChange={setAllowMessages} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Analytics</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Data Sharing</Text>
            <Text style={styles.settingDescription}>
              Share anonymous usage data to improve the app
            </Text>
          </View>
          <Switch value={dataSharing} onValueChange={setDataSharing} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Your privacy is important to us. We will never sell your personal
          information to third parties. See our Privacy Policy for more details.
        </Text>
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
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
});
