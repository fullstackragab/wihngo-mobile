import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Stories() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStories = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await storyService.getStories();
      setStories([]);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  const handleLike = async (storyId: string) => {
    try {
      // TODO: Implement like functionality
      // await storyService.likeStory(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.storyId === storyId
            ? {
                ...story,
                likes: story.isLiked ? story.likes - 1 : story.likes + 1,
                isLiked: !story.isLiked,
              }
            : story
        )
      );
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`./story/${item.storyId}`)}
      activeOpacity={0.9}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.storyImage} />
      )}

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <FontAwesome6 name="user" size={14} color="#999" />
            )}
          </View>
          <Text style={styles.userName}>{item.userName}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLike(item.storyId);
            }}
          >
            <FontAwesome6
              name="heart"
              size={16}
              color={item.isLiked ? "#FF6B6B" : "#CCC"}
              solid={item.isLiked}
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <FontAwesome6 name="comment" size={16} color="#CCC" />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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
        <Text style={styles.headerTitle}>Stories</Text>
      </View>

      {/* Stories List */}
      {stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.storyId}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="book-open" size={40} color="#E0E0E0" />
          <Text style={styles.emptyText}>No stories yet</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push("./create-story")}
          >
            <Text style={styles.createFirstButtonText}>Create Story</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("./create-story")}
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
  storyCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  storyImage: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F0F0F0",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  content: {
    fontSize: Typography.body,
    color: "#666",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: Typography.small,
    fontWeight: "500",
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: Typography.small,
    color: "#999",
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
