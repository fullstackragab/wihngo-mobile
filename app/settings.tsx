import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const router = useRouter();

  const SettingsItem = ({
    icon,
    title,
    onPress,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <FontAwesome6 name={icon as any} size={20} color="#666" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <FontAwesome6 name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingsItem
          icon="user-pen"
          title="Edit Profile"
          onPress={() => router.push("/edit-profile")}
        />
        <SettingsItem
          icon="bell"
          title="Notifications"
          onPress={() => router.push("/notifications-settings")}
        />
        <SettingsItem
          icon="lock"
          title="Privacy"
          onPress={() => router.push("/privacy-settings")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingsItem
          icon="palette"
          title="Theme"
          onPress={() => {
            // TODO: Implement theme toggle
          }}
        />
        <SettingsItem
          icon="language"
          title="Language"
          onPress={() => {
            // TODO: Implement language settings
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingsItem
          icon="circle-question"
          title="Help & Support"
          onPress={() => {
            // TODO: Implement help page
          }}
        />
        <SettingsItem
          icon="file-lines"
          title="Terms of Service"
          onPress={() => {
            // TODO: Implement terms page
          }}
        />
        <SettingsItem
          icon="shield-halved"
          title="Privacy Policy"
          onPress={() => {
            // TODO: Implement privacy policy page
          }}
        />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
});
