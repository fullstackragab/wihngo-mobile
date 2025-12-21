import { NavigationChevron } from "@/components/navigation-chevron";
import { useLanguage } from "@/contexts/language-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  I18nManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const router = useRouter();
  const { language, setLanguage, isRTL } = useLanguage();
  const { t, i18n } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Force re-render when language changes
  console.log(
    "🔍 Settings rendering with language:",
    language,
    "i18n:",
    i18n.language
  );
  console.log("🔍 Sample translations:", {
    language: t("settings.language"),
    notifications: t("settings.notifications"),
  });

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "zh", name: "简体中文", flag: "🇨🇳" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
  ];

  const handleLanguageChange = async (langCode: string) => {
    try {
      await setLanguage(langCode);
      setShowLanguageModal(false);
    } catch (error) {
      Alert.alert(t("common.error"), t("settings.languageChangeError"));
    }
  };

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
      <NavigationChevron size={14} color="#999" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
        {/* <SettingsItem
          icon="user-pen"
          title={t("settings.editProfile")}
          onPress={() => router.push("/edit-profile")}
        /> */}
        <SettingsItem
          icon="bell"
          title={t("settings.notifications")}
          onPress={() => router.push("/notifications-settings")}
        />
        <SettingsItem
          icon="lock"
          title={t("settings.privacy")}
          onPress={() => router.push("/privacy-settings")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.fundsReceived")}</Text>
        <SettingsItem
          icon="wallet"
          title={t("settings.payoutSettings")}
          onPress={() => router.push("/payout-settings")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.appSettings")}</Text>
        <SettingsItem
          icon="palette"
          title={t("settings.theme")}
          onPress={() => {
            // TODO: Implement theme toggle
          }}
        />
        <SettingsItem
          icon="language"
          title={t("settings.language")}
          onPress={() => setShowLanguageModal(true)}
        />
        <SettingsItem
          icon="sliders"
          title={t("settings.contentPreferences")}
          onPress={() => router.push("/content-preferences")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.support")}</Text>
        <SettingsItem
          icon="circle-question"
          title={t("faq.title")}
          onPress={() => router.push("/faq")}
        />
        <SettingsItem
          icon="file-lines"
          title={t("settings.termsOfService")}
          onPress={() => router.push("/terms-of-service")}
        />
        <SettingsItem
          icon="shield-halved"
          title={t("settings.privacyPolicy")}
          onPress={() => router.push("/privacy-policy")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
        <View style={styles.aboutContainer}>
          <Text style={styles.appName}>Wihngo</Text>
          <Text style={styles.appVersion}>
            {t("settings.version")} {Constants.expoConfig?.version || "1.0.0"}
          </Text>
          <View style={styles.attributionContainer}>
            <Text style={styles.attributionText}>
              {t("settings.appIconBy")}{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.freepik.com/icon/bird_3069186")
              }
            >
              <Text style={styles.attributionLink}>Freepik</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.language")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <FontAwesome6 name="xmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <FontAwesome6 name="check" size={16} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingBottom: 40,
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
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingLeft: I18nManager.isRTL ? 26 : 16,
    paddingRight: I18nManager.isRTL ? 16 : 26,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  languageOption: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: "#F0F9F8",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    flexWrap: "wrap",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  languageNameActive: {
    fontWeight: "600",
    color: "#4ECDC4",
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  attributionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attributionText: {
    fontSize: 12,
    color: "#999",
  },
  attributionLink: {
    fontSize: 12,
    color: "#4ECDC4",
    textDecorationLine: "underline",
  },
});
