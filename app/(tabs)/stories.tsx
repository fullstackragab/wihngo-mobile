import StoryCardWithVideo from "@/components/story-card-with-video";
import { VideoPreloader } from "@/components/video-preloader";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useStories } from "@/hooks/useStories";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const PAGE_SIZE = 10;

export default function Stories() {
  const { t } = useTranslation();
  const router = useRouter();
  const [visibleStoryId, setVisibleStoryId] = useState<string | null>(null);

  // Use React Query hook for automatic caching and background updates
  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStories(PAGE_SIZE);

  // Flatten all pages into a single array of stories
  const stories = data?.pages.flatMap((page) => page.items) ?? [];

  // Preload next 2 and previous 1 videos for smooth transitions
  const videosToPreload = useMemo(() => {
    if (!visibleStoryId || stories.length === 0) return [];

    const currentIndex = stories.findIndex((s) => s.storyId === visibleStoryId);
    if (currentIndex === -1) return [];

    const preloadUrls: string[] = [];

    // Preload previous video
    if (currentIndex > 0 && stories[currentIndex - 1].videoUrl) {
      preloadUrls.push(stories[currentIndex - 1].videoUrl);
    }

    // Preload next 2 videos
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < stories.length && stories[nextIndex].videoUrl) {
        preloadUrls.push(stories[nextIndex].videoUrl);
      }
    }

    return preloadUrls;
  }, [visibleStoryId, stories]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70, // 70% of item must be visible
    minimumViewTime: 100, // Faster detection for immediate playback
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Find first story with video that's viewable
      const visibleStoryWithVideo = viewableItems.find(
        (item) => item.item && (item.item as Story).videoUrl
      );

      if (visibleStoryWithVideo && visibleStoryWithVideo.item) {
        setVisibleStoryId((visibleStoryWithVideo.item as Story).storyId);
      } else {
        setVisibleStoryId(null);
      }
    }
  ).current;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleLike = async (storyId: string) => {
    // Like functionality not yet implemented by backend
    console.warn("⚠️ Like functionality not yet implemented");
  };

  if (isLoading && !stories.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("stories.title")}</Text>
      </View>

      {/* Preload adjacent videos for smooth playback */}
      {videosToPreload.map((url) => (
        <VideoPreloader key={url} videoUrl={url} />
      ))}

      {/* Stories List */}
      {stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={({ item }) => (
            <StoryCardWithVideo
              story={item}
              onPress={() => router.push(`/story/${item.storyId}`)}
              onLike={handleLike}
              shouldPlay={visibleStoryId === item.storyId}
            />
          )}
          keyExtractor={(item) => item.storyId}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#4ECDC4" />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="book-open" size={40} color="#E0E0E0" />
          <Text style={styles.emptyText}>{t("stories.emptyText")}</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push("/create-story")}
          >
            <Text style={styles.createFirstButtonText}>
              {t("stories.createFirst")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-story")}
      >
        <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.hero,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.body,
    color: "#999",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  createFirstButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: "#1A1A1A",
    borderRadius: BorderRadius.md,
  },
  createFirstButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.body,
    fontWeight: "500",
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
