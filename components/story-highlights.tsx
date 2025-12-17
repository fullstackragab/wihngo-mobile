import { theme } from "@/constants/theme";
import { useNotifications } from "@/contexts/notification-context";
import { highlightStory, unhighlightStory } from "@/services/premium.service";
import { Story } from "@/types/story";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type StoryHighlightsProps = {
  birdId: string;
  stories: Story[];
  onUpdate?: () => void;
};

const MAX_HIGHLIGHTS = 3;

export function StoryHighlights({
  birdId,
  stories,
  onUpdate,
}: StoryHighlightsProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const highlightedStories = stories
    .filter((s) => s.isHighlighted)
    .sort((a, b) => (a.highlightOrder || 0) - (b.highlightOrder || 0))
    .slice(0, MAX_HIGHLIGHTS);

  const handleToggleHighlight = async (story: Story) => {
    const currentHighlightCount = highlightedStories.length;

    if (story.isHighlighted) {
      // Remove highlight
      setIsLoading(true);
      try {
        await unhighlightStory(birdId, story.storyId);
        // Success - user sees updated UI
        onUpdate?.();
      } catch (error) {
        console.error("Failed to remove highlight:", error);
        addNotification(
          "recommendation",
          "Highlight Error",
          "Failed to remove highlight"
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Add highlight
      if (currentHighlightCount >= MAX_HIGHLIGHTS) {
        // Limit reached - user can see UI state
        return;
      }

      setIsLoading(true);
      try {
        const nextOrder = currentHighlightCount + 1;
        await highlightStory(birdId, story.storyId, nextOrder);
        // Success - user sees updated UI
        onUpdate?.();
      } catch (error) {
        console.error("Failed to add highlight:", error);
        addNotification(
          "recommendation",
          "Highlight Error",
          "Failed to add highlight"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (highlightedStories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="bookmark-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.emptyText}>{t("story.noHighlightedStories")}</Text>
        <Text style={styles.emptySubtext}>
          {t("story.pinStories", { count: MAX_HIGHLIGHTS })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bookmark" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>{t("story.storyHighlights")}</Text>
        <Text style={styles.count}>
          {highlightedStories.length}/{MAX_HIGHLIGHTS}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {highlightedStories.map((story) => (
          <HighlightedStoryCard
            key={story.storyId}
            story={story}
            onRemove={() => handleToggleHighlight(story)}
            disabled={isLoading}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type HighlightedStoryCardProps = {
  story: Story;
  onRemove: () => void;
  disabled: boolean;
};

function HighlightedStoryCard({
  story,
  onRemove,
  disabled,
}: HighlightedStoryCardProps) {
  // Get preview text (new API structure) or fall back to legacy content
  const previewText = story.preview || story.content || "No content";
  const dateText =
    story.date ||
    (story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "");

  return (
    <View style={styles.card}>
      {story.imageUrl ? (
        <Image source={story.imageUrl} style={styles.cardImage} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons
            name="image-outline"
            size={32}
            color={theme.colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {previewText}
        </Text>
        <Text style={styles.cardDate}>{dateText}</Text>
      </View>

      <Pressable
        style={styles.removeButton}
        onPress={onRemove}
        disabled={disabled}
      >
        <Ionicons
          name="close-circle"
          size={24}
          color={theme.colors.error || "#f44336"}
        />
      </Pressable>
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
    flex: 1,
  },
  count: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flexDirection: "row",
  },
  card: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
  },
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
