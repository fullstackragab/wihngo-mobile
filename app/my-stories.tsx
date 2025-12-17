import { useAuth } from "@/contexts/auth-context";
import { storyService } from "@/services/story.service";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyStories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const loadMyStories = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get authenticated user's stories from /api/stories/my-stories
      // Note: Pagination support available but loading all for now
      const response = await storyService.getMyStories(1, 100);
      console.log(`📚 My stories fetched: ${response.items.length}`);
      setStories(response.items);
    } catch (error) {
      console.error("❌ Failed to load stories:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Reload stories when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMyStories();
    }, [loadMyStories])
  );

  const handleDeleteStory = async (storyId: string) => {
    Alert.alert(
      t("story.deleteConfirmTitle"),
      t("story.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await storyService.deleteStory(storyId);
              setStories(stories.filter((s) => s.storyId !== storyId));
              Alert.alert(t("common.success"), t("story.deleteSuccess"));
            } catch (error: any) {
              console.error("❌ Failed to delete story:", error);
              const errorMessage =
                error?.message?.includes("403") ||
                error?.message?.includes("Forbidden")
                  ? t("story.noPermission")
                  : t("story.deleteFailed");
              Alert.alert(t("common.error"), errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleEditStory = (storyId: string) => {
    router.push(`/edit-story/${storyId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome6 name="lock" size={48} color="#95A5A6" />
        <Text style={styles.emptyText}>{t("common.notLoggedIn")}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/welcome")}
        >
          <Text style={styles.loginButtonText}>{t("common.goToLogin")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome6 name="book-open" size={64} color="#E8E8E8" />
        <Text style={styles.emptyText}>{t("story.noStories")}</Text>
        <Text style={styles.emptySubtext}>{t("story.noStoriesSubtext")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/create-story")}
        >
          <FontAwesome6 name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>{t("story.addFirstStory")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStoryCard = ({ item }: { item: Story }) => (
    <View style={styles.storyCard}>
      {item.imageUrl && (
        <Image source={item.imageUrl} style={styles.storyImage} contentFit="cover" cachePolicy="memory-disk" />
      )}
      <View style={styles.storyContent}>
        {/* Story Preview */}
        <Text style={styles.storyText} numberOfLines={4}>
          {item.preview}
        </Text>
        <View style={styles.storyMeta}>
          {/* Birds */}
          {item.birds && item.birds.length > 0 && (
            <View style={styles.birdsRow}>
              <FontAwesome6 name="tag" size={12} color="#999" />
              <Text style={styles.birdsText}>{item.birds.join(", ")}</Text>
            </View>
          )}
          {/* Date */}
          <Text style={styles.storyDate}>{item.date}</Text>
        </View>
        <View style={styles.storyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/story/${item.storyId}`)}
          >
            <FontAwesome6 name="eye" size={16} color="#4ECDC4" />
            <Text style={styles.actionText}>{t("common.view")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditStory(item.storyId)}
          >
            <FontAwesome6 name="pen" size={16} color="#666" />
            <Text style={styles.actionText}>{t("common.edit")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteStory(item.storyId)}
          >
            <FontAwesome6 name="trash" size={16} color="#FF6B6B" />
            <Text style={[styles.actionText, styles.deleteText]}>
              {t("common.delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("story.myStories"),
          presentation: "card",
        }}
      />
      <FlatList
        data={stories}
        keyExtractor={(item) => item.storyId}
        renderItem={renderStoryCard}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadMyStories}
      />

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
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F0F0F0",
  },
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  storyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  storyMeta: {
    gap: 8,
    marginBottom: 12,
  },
  birdsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  birdsText: {
    fontSize: 12,
    color: "#666",
  },
  storyDate: {
    fontSize: 12,
    color: "#95A5A6",
  },
  storyStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  storyActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  deleteButton: {
    backgroundColor: "#FFF5F5",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  deleteText: {
    color: "#FF6B6B",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#7F8C8D",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 8,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
