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
    <View style={styles.storyCard}>
      {/* Header */}
      <View style={styles.storyHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <FontAwesome6 name="user" size={20} color="#95A5A6" />
            )}
          </View>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <FontAwesome6 name="ellipsis" size={20} color="#95A5A6" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity
        onPress={() => router.push(`./story/${item.storyId}`)}
        activeOpacity={0.9}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={3}>
          {item.content}
        </Text>

        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.storyImage} />
        )}

        {item.birdName && (
          <View style={styles.birdTag}>
            <FontAwesome6 name="dove" size={14} color="#4ECDC4" />
            <Text style={styles.birdTagText}>{item.birdName}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.storyId)}
        >
          <FontAwesome6
            name="heart"
            size={20}
            color={item.isLiked ? "#FF6B6B" : "#95A5A6"}
            solid={item.isLiked}
          />
          <Text
            style={[styles.actionText, item.isLiked && styles.actionTextActive]}
          >
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`./story/${item.storyId}`)}
        >
          <FontAwesome6 name="comment" size={20} color="#95A5A6" />
          <Text style={styles.actionText}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome6 name="share-nodes" size={20} color="#95A5A6" />
        </TouchableOpacity>
      </View>
    </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("./create-story")}
        >
          <FontAwesome6 name="plus" size={20} color="#fff" />
        </TouchableOpacity>
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
          <FontAwesome6 name="book-open" size={60} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Stories Yet</Text>
          <Text style={styles.emptyText}>
            Be the first to share your bird story!
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push("./create-story")}
          >
            <FontAwesome6 name="plus" size={16} color="#fff" />
            <Text style={styles.createFirstButtonText}>Create Story</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  createButton: {
    backgroundColor: "#4ECDC4",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  timestamp: {
    fontSize: 12,
    color: "#95A5A6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
    marginBottom: 12,
  },
  storyImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
    marginBottom: 12,
  },
  birdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F8F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  birdTagText: {
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "600",
  },
  actionTextActive: {
    color: "#FF6B6B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
