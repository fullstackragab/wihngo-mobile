/**
 * Content Preferences Screen
 *
 * Allows users to customize their content feed by:
 * - Selecting preferred content languages (multi-select from 16 languages)
 * - Setting their country for location-based content
 */

import { NavigationChevron } from "@/components/navigation-chevron";
import { useLanguage } from "@/contexts/language-context";
import {
  useUpdateCountry,
  useUpdatePreferredLanguages,
  useUserPreferences,
} from "@/hooks/useFeed";
import { SUPPORTED_CONTENT_LANGUAGES } from "@/types/feed";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Country list for selection
const COUNTRIES = [
  { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "GB", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "SA", name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "AE", name: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
  { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
  { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "AR", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },
  { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "TW", name: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}" },
  { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
  { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
  { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
  { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
];

export default function ContentPreferences() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Fetch current preferences
  const { data: preferences, isLoading } = useUserPreferences();

  // Mutations
  const updateLanguages = useUpdatePreferredLanguages();
  const updateCountry = useUpdateCountry();

  // Local state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with fetched preferences
  useEffect(() => {
    if (preferences) {
      setSelectedLanguages(preferences.preferredLanguages || ["en"]);
      setSelectedCountry(preferences.country);
    }
  }, [preferences]);

  // Track changes
  useEffect(() => {
    if (preferences) {
      const languagesChanged =
        JSON.stringify(selectedLanguages.sort()) !==
        JSON.stringify((preferences.preferredLanguages || []).sort());
      const countryChanged = selectedCountry !== preferences.country;
      setHasChanges(languagesChanged || countryChanged);
    }
  }, [selectedLanguages, selectedCountry, preferences]);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        // Don't allow deselecting if it's the last language
        if (prev.length === 1) {
          Alert.alert(
            t("contentPreferences.error"),
            t("contentPreferences.atLeastOneLanguage")
          );
          return prev;
        }
        return prev.filter((l) => l !== code);
      }
      return [...prev, code];
    });
  };

  const handleSave = async () => {
    try {
      // Save languages if changed
      if (
        JSON.stringify(selectedLanguages.sort()) !==
        JSON.stringify((preferences?.preferredLanguages || []).sort())
      ) {
        await updateLanguages.mutateAsync(selectedLanguages);
      }

      // Save country if changed
      if (selectedCountry !== preferences?.country && selectedCountry) {
        await updateCountry.mutateAsync(selectedCountry);
      }

      Alert.alert(
        t("common.success"),
        t("contentPreferences.saveSuccess"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t("common.error"), t("contentPreferences.saveError"));
    }
  };

  const getSelectedLanguageNames = () => {
    return selectedLanguages
      .map((code) => {
        const lang = SUPPORTED_CONTENT_LANGUAGES.find((l) => l.code === code);
        return lang?.name || code;
      })
      .join(", ");
  };

  const getSelectedCountryName = () => {
    if (!selectedCountry) return t("contentPreferences.notSet");
    const country = COUNTRIES.find((c) => c.code === selectedCountry);
    return country ? `${country.flag} ${country.name}` : selectedCountry;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <FontAwesome6 name="wand-magic-sparkles" size={24} color="#4ECDC4" />
          <Text style={styles.description}>
            {t("contentPreferences.description")}
          </Text>
        </View>

        {/* Languages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("contentPreferences.languages")}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t("contentPreferences.languagesSubtitle")}
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.selectorContent}>
              <FontAwesome6 name="language" size={18} color="#666" />
              <Text style={styles.selectorText} numberOfLines={2}>
                {getSelectedLanguageNames()}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedLanguages.length}</Text>
            </View>
            <NavigationChevron size={14} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Country Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("contentPreferences.country")}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t("contentPreferences.countrySubtitle")}
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCountryModal(true)}
          >
            <View style={styles.selectorContent}>
              <FontAwesome6 name="location-dot" size={18} color="#666" />
              <Text style={styles.selectorText}>{getSelectedCountryName()}</Text>
            </View>
            <NavigationChevron size={14} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <FontAwesome6 name="circle-info" size={16} color="#4ECDC4" />
          <Text style={styles.infoText}>
            {t("contentPreferences.infoText")}
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (updateLanguages.isPending || updateCountry.isPending) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={updateLanguages.isPending || updateCountry.isPending}
          >
            {updateLanguages.isPending || updateCountry.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("contentPreferences.selectLanguages")}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <FontAwesome6 name="xmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SUPPORTED_CONTENT_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionItem,
                    selectedLanguages.includes(lang.code) &&
                      styles.optionItemActive,
                  ]}
                  onPress={() => toggleLanguage(lang.code)}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionName}>{lang.name}</Text>
                    <Text style={styles.optionSubname}>{lang.englishName}</Text>
                  </View>
                  {selectedLanguages.includes(lang.code) && (
                    <FontAwesome6 name="check" size={16} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("contentPreferences.selectCountry")}
              </Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <FontAwesome6 name="xmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Clear option */}
              <TouchableOpacity
                style={[styles.optionItem, !selectedCountry && styles.optionItemActive]}
                onPress={() => {
                  setSelectedCountry(undefined);
                  setShowCountryModal(false);
                }}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionName}>
                    {t("contentPreferences.noCountry")}
                  </Text>
                  <Text style={styles.optionSubname}>
                    {t("contentPreferences.showAllCountries")}
                  </Text>
                </View>
                {!selectedCountry && (
                  <FontAwesome6 name="check" size={16} color="#4ECDC4" />
                )}
              </TouchableOpacity>

              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.optionItem,
                    selectedCountry === country.code && styles.optionItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCountry(country.code);
                    setShowCountryModal(false);
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionFlag}>{country.flag}</Text>
                    <Text style={styles.optionName}>{country.name}</Text>
                  </View>
                  {selectedCountry === country.code && (
                    <FontAwesome6 name="check" size={16} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  descriptionContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  selector: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectorContent: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  badge: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#F0F9F8",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4ECDC4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  },
  optionItem: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemActive: {
    backgroundColor: "#F0F9F8",
  },
  optionLeft: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionFlag: {
    fontSize: 24,
  },
  optionName: {
    fontSize: 16,
    color: "#333",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  optionSubname: {
    fontSize: 12,
    color: "#999",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  modalDoneButton: {
    backgroundColor: "#4ECDC4",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalDoneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
