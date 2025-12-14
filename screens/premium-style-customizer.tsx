import {
  getPremiumStyle,
  updatePremiumStyle,
} from "@/services/premium.service";
import { PremiumStyleResponse, UpdatePremiumStyleDto } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PremiumStyleCustomizerProps {
  birdId: string;
  onStyleUpdated?: () => void;
}

// Style options
const FRAMES = [
  { id: "gold", name: "Gold", color: "#FFD700" },
  { id: "silver", name: "Silver", color: "#C0C0C0" },
  { id: "rainbow", name: "Rainbow", color: "#FF69B4" },
  { id: "rose", name: "Rose Gold", color: "#B76E79" },
];

const BADGES = [
  { id: "star", name: "Star", icon: "star" },
  { id: "heart", name: "Heart", icon: "heart" },
  { id: "crown", name: "Crown", icon: "trophy" },
  { id: "diamond", name: "Diamond", icon: "diamond" },
];

const THEMES = [
  { id: "sunset", name: "Sunset", colors: ["#FF6B6B", "#FFA500"] },
  { id: "ocean", name: "Ocean", colors: ["#4ECDC4", "#3498DB"] },
  { id: "forest", name: "Forest", colors: ["#66BB6A", "#2E7D32"] },
  { id: "lavender", name: "Lavender", colors: ["#9C27B0", "#BA68C8"] },
];

export default function PremiumStyleCustomizer({
  birdId,
  onStyleUpdated,
}: PremiumStyleCustomizerProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentStyle, setCurrentStyle] = useState<PremiumStyleResponse | null>(
    null
  );
  const [selectedFrame, setSelectedFrame] = useState<string>("gold");
  const [selectedBadge, setSelectedBadge] = useState<string>("star");
  const [selectedTheme, setSelectedTheme] = useState<string>("sunset");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentStyle();
  }, [birdId]);

  const loadCurrentStyle = async () => {
    try {
      setLoading(true);
      const style = await getPremiumStyle(birdId);
      setCurrentStyle(style);

      // Set selected options from current style
      if (style.frameId) setSelectedFrame(style.frameId);
      if (style.badgeId) setSelectedBadge(style.badgeId);
      if (style.themeId) setSelectedTheme(style.themeId);
    } catch (error) {
      console.log("No existing style, using defaults");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const selectedThemeData = THEMES.find((t) => t.id === selectedTheme);
      const dto: UpdatePremiumStyleDto = {
        frameId: selectedFrame,
        badgeId: selectedBadge,
        themeId: selectedTheme,
        highlightColor: selectedThemeData?.colors[0] || "#FFD700",
      };

      await updatePremiumStyle(birdId, dto);

      Alert.alert(t("premium.success"), t("premium.styleUpdated"), [
        {
          text: t("common.ok"),
          onPress: () => {
            onStyleUpdated?.();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating style:", error);
      Alert.alert(
        t("premium.error"),
        error.message || t("premium.failedToUpdateStyle")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("premium.loadingStyle")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="color-palette" size={48} color="#4ECDC4" />
        <Text style={styles.title}>{t("premium.customizeStyle")}</Text>
        <Text style={styles.subtitle}>{t("premium.makeYourBirdUnique")}</Text>
      </View>

      {/* Frame Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="square-outline" size={20} color="#2C3E50" />
          <Text style={styles.sectionTitle}>{t("premium.profileFrame")}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {FRAMES.map((frame) => (
            <TouchableOpacity
              key={frame.id}
              style={[
                styles.optionCard,
                selectedFrame === frame.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedFrame(frame.id)}
            >
              <View
                style={[
                  styles.framePreview,
                  {
                    borderColor: frame.color,
                    borderWidth: selectedFrame === frame.id ? 4 : 2,
                  },
                ]}
              >
                <Ionicons name="image" size={24} color={frame.color} />
              </View>
              <Text style={styles.optionName}>{frame.name}</Text>
              {selectedFrame === frame.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#4ECDC4"
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Badge Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={20} color="#2C3E50" />
          <Text style={styles.sectionTitle}>{t("premium.premiumBadge")}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {BADGES.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.optionCard,
                selectedBadge === badge.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedBadge(badge.id)}
            >
              <View style={styles.badgePreview}>
                <Ionicons
                  name={badge.icon as any}
                  size={32}
                  color={selectedBadge === badge.id ? "#FFD700" : "#BDC3C7"}
                />
              </View>
              <Text style={styles.optionName}>{badge.name}</Text>
              {selectedBadge === badge.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#4ECDC4"
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Theme Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette" size={20} color="#2C3E50" />
          <Text style={styles.sectionTitle}>{t("premium.colorTheme")}</Text>
        </View>

        <View style={styles.themesContainer}>
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                selectedTheme === theme.id && styles.selectedTheme,
              ]}
              onPress={() => setSelectedTheme(theme.id)}
            >
              <View style={styles.themePreview}>
                <View
                  style={[
                    styles.themeColorBox,
                    { backgroundColor: theme.colors[0] },
                  ]}
                />
                <View
                  style={[
                    styles.themeColorBox,
                    { backgroundColor: theme.colors[1] },
                  ]}
                />
              </View>
              <Text style={styles.themeName}>{theme.name}</Text>
              {selectedTheme === theme.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#4ECDC4"
                  style={styles.themeCheckmark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="eye" size={20} color="#2C3E50" />
          <Text style={styles.sectionTitle}>{t("premium.preview")}</Text>
        </View>

        <View style={styles.previewCard}>
          <View
            style={[
              styles.previewFrame,
              {
                borderColor:
                  FRAMES.find((f) => f.id === selectedFrame)?.color ||
                  "#FFD700",
                borderWidth: 4,
              },
            ]}
          >
            <Ionicons name="image" size={48} color="#BDC3C7" />
          </View>

          <View style={styles.previewBadge}>
            <Ionicons
              name={
                (BADGES.find((b) => b.id === selectedBadge)?.icon as any) ||
                "star"
              }
              size={20}
              color="#FFD700"
            />
            <Text style={styles.previewBadgeText}>
              {t("premium.celebratedBird")}
            </Text>
          </View>

          <View
            style={[
              styles.previewTheme,
              {
                backgroundColor:
                  THEMES.find((t) => t.id === selectedTheme)?.colors[0] ||
                  "#FF6B6B",
              },
            ]}
          >
            <Text style={styles.previewThemeText}>
              {THEMES.find((t) => t.id === selectedTheme)?.name} Theme
            </Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8F8F7",
    position: "relative",
  },
  selectedOption: {
    borderColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  framePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  badgePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  themesContainer: {
    gap: 12,
  },
  themeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#E8F8F7",
    position: "relative",
  },
  selectedTheme: {
    borderColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  themePreview: {
    flexDirection: "row",
    gap: 4,
  },
  themeColorBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  themeCheckmark: {
    marginRight: 8,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 16,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFB84D",
  },
  previewTheme: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  previewThemeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
