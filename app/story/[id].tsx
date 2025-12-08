import { Story, StoryComment } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function StoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadStoryDetail();
  }, [id]);

  const loadStoryDetail = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await storyService.getStoryDetail(id);
      // setStory(data);
      // setComments(data.comments);
    } catch (error) {
      console.error("Error loading story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!story) return;
    try {
      // TODO: API call
      setStory({
        ...story,
        likes: story.isLiked ? story.likes - 1 : story.likes + 1,
        isLiked: !story.isLiked,
      });
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !story) return;

    setSubmittingComment(true);
    try {
      // TODO: API call
      // const newComment = await storyService.addComment(story.storyId, commentText);
      // setComments([...comments, newComment]);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story</Text>
        <TouchableOpacity>
          <FontAwesome6 name="ellipsis" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Author Info */}
        <View style={styles.authorSection}>
          <View style={styles.avatar}>
            {story.userAvatar ? (
              <Image
                source={{ uri: story.userAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <FontAwesome6 name="user" size={24} color="#95A5A6" />
            )}
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{story.userName}</Text>
            <Text style={styles.timestamp}>
              {new Date(story.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Story Content */}
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.contentText}>{story.content}</Text>

        {story.imageUrl && (
          <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
        )}

        {story.birdName && (
          <TouchableOpacity
            style={styles.birdTag}
            onPress={() => router.push(`/(tabs)/birds/${story.birdId}`)}
          >
            <FontAwesome6 name="dove" size={16} color="#4ECDC4" />
            <Text style={styles.birdTagText}>{story.birdName}</Text>
            <FontAwesome6 name="arrow-right" size={14} color="#4ECDC4" />
          </TouchableOpacity>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <FontAwesome6
              name="heart"
              size={24}
              color={story.isLiked ? "#FF6B6B" : "#95A5A6"}
              solid={story.isLiked}
            />
            <Text
              style={[
                styles.actionText,
                story.isLiked && styles.actionTextActive,
              ]}
            >
              {story.likes}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <FontAwesome6 name="comment" size={24} color="#95A5A6" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome6 name="share-nodes" size={24} color="#95A5A6" />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.commentId} style={styles.commentCard}>
                <View style={styles.commentAvatar}>
                  {comment.userAvatar ? (
                    <Image
                      source={{ uri: comment.userAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <FontAwesome6 name="user" size={16} color="#95A5A6" />
                  )}
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor="#95A5A6"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submittingComment}
        >
          <FontAwesome6
            name="paper-plane"
            size={20}
            color={commentText.trim() ? "#4ECDC4" : "#BDC3C7"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  content: {
    flex: 1,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  timestamp: {
    fontSize: 13,
    color: "#95A5A6",
    marginTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  storyImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#E8E8E8",
    marginBottom: 20,
  },
  birdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F8F7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  birdTagText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    color: "#95A5A6",
    fontWeight: "600",
  },
  actionTextActive: {
    color: "#FF6B6B",
  },
  commentsSection: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  commentTime: {
    fontSize: 12,
    color: "#95A5A6",
  },
  commentText: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
    paddingVertical: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2C3E50",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: "#95A5A6",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
