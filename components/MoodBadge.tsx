import { STORY_MOODS, StoryMode } from "@/types/story";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MoodBadgeProps = {
  mode?: StoryMode | null;
  size?: "small" | "medium" | "large";
  style?: any;
};

export function MoodBadge({ mode, size = "small", style }: MoodBadgeProps) {
  // Don't render anything if no mood
  if (!mode) return null;

  const moodInfo = STORY_MOODS.find((m) => m.value === mode);
  if (!moodInfo) return null;

  const sizeStyles = {
    small: styles.containerSmall,
    medium: styles.containerMedium,
    large: styles.containerLarge,
  };

  const emojiSizeStyles = {
    small: styles.emojiSmall,
    medium: styles.emojiMedium,
    large: styles.emojiLarge,
  };

  const labelSizeStyles = {
    small: styles.labelSmall,
    medium: styles.labelMedium,
    large: styles.labelLarge,
  };

  return (
    <View style={[styles.container, sizeStyles[size], style]}>
      <Text style={[styles.emoji, emojiSizeStyles[size]]}>
        {moodInfo.emoji}
      </Text>
      <Text style={[styles.label, labelSizeStyles[size]]}>
        {moodInfo.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9F9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    gap: 4,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  containerLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emoji: {
    fontSize: 14,
  },
  emojiSmall: {
    fontSize: 12,
  },
  emojiMedium: {
    fontSize: 14,
  },
  emojiLarge: {
    fontSize: 16,
  },
  label: {
    color: "#2C3E50",
    fontWeight: "600",
  },
  labelSmall: {
    fontSize: 11,
  },
  labelMedium: {
    fontSize: 13,
  },
  labelLarge: {
    fontSize: 15,
  },
});
