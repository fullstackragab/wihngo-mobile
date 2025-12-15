import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function PrivacySettings() {
  const { t } = useTranslation();
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showBirds, setShowBirds] = useState(true);
  const [showStories, setShowStories] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("privacySettings.profileVisibility")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.publicProfile")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.publicProfileDesc")}
            </Text>
          </View>
          <Switch value={profilePublic} onValueChange={setProfilePublic} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.showEmail")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.showEmailDesc")}
            </Text>
          </View>
          <Switch value={showEmail} onValueChange={setShowEmail} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.showMyBirds")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.showMyBirdsDesc")}
            </Text>
          </View>
          <Switch value={showBirds} onValueChange={setShowBirds} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.showMyStories")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.showMyStoriesDesc")}
            </Text>
          </View>
          <Switch value={showStories} onValueChange={setShowStories} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("privacySettings.communication")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.allowMessages")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.allowMessagesDesc")}
            </Text>
          </View>
          <Switch value={allowMessages} onValueChange={setAllowMessages} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("privacySettings.dataAnalytics")}
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              {t("privacySettings.dataSharing")}
            </Text>
            <Text style={styles.settingDescription}>
              {t("privacySettings.dataSharingDesc")}
            </Text>
          </View>
          <Switch value={dataSharing} onValueChange={setDataSharing} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          {t("privacySettings.privacyNotice")}
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
