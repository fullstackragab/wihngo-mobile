import { CUSTOM_THEMES } from "@/constants/premium-config";
import { theme } from "@/constants/theme";
import { useNotifications } from "@/contexts/notification-context";
import { updateBirdPremiumStyle } from "@/services/premium.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type CustomThemeSelectorProps = {
  birdId: string;
  currentThemeId?: string;
  onThemeUpdate?: (themeId: string) => void;
  isPremium: boolean;
};

export function CustomThemeSelector({
  birdId,
  currentThemeId = "default",
  onThemeUpdate,
  isPremium,
}: CustomThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const handleThemeSelect = async (themeId: string) => {
    const themeConfig = CUSTOM_THEMES.find((t) => t.id === themeId);

    if (!themeConfig?.free && !isPremium) {
      // Premium required - user can see premium badge in UI
      return;
    }

    setIsLoading(true);
    try {
      await updateBirdPremiumStyle(birdId, { themeId });
      setSelectedTheme(themeId);
      onThemeUpdate?.(themeId);
      // Success - user sees updated theme
    } catch (error) {
      console.error("Failed to update theme:", error);
      addNotification(
        "recommendation",
        "Theme Update Error",
        "Failed to update theme. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="color-palette" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Profile Theme</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.themesScroll}
      >
        {CUSTOM_THEMES.map((themeConfig) => (
          <Pressable
            key={themeConfig.id}
            style={[
              styles.themeCard,
              selectedTheme === themeConfig.id && styles.themeCardSelected,
            ]}
            onPress={() => handleThemeSelect(themeConfig.id)}
            disabled={isLoading}
          >
            <LinearGradient
              colors={themeConfig.gradientColors as any}
              style={styles.themePreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {selectedTheme === themeConfig.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              )}
            </LinearGradient>

            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>{themeConfig.name}</Text>
              {!themeConfig.free && (
                <View style={styles.premiumTag}>
                  <Ionicons name="star" size={10} color={theme.colors.accent} />
                  <Text style={styles.premiumTagText}>Premium</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.hint}>
        Choose a theme that reflects your bird&apos;s personality
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  themesScroll: {
    marginBottom: 8,
  },
  themeCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeCardSelected: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  themePreview: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: {
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  themeName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  premiumTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.accent}20`,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumTagText: {
    fontSize: 10,
    color: theme.colors.accent,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
