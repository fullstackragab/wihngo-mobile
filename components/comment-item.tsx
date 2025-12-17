/**
 * CommentItem Component
 * Displays a single comment with like button, reply functionality, and nested replies
 */

import { useAuth } from "@/contexts/auth-context";
import { commentService } from "@/services/comment.service";
import { Comment } from "@/types/like-comment";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string, userName: string) => void;
  onDelete?: (commentId: string) => void;
  onUpdate?: (commentId: string, newContent: string) => void;
  onLikeChange?: (
    commentId: string,
    isLiked: boolean,
    newCount: number
  ) => void;
  depth?: number; // Nesting depth (0 = top-level)
  showReplies?: boolean;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  onUpdate,
  onLikeChange,
  depth = 0,
  showReplies = true,
}: CommentItemProps) {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showRepliesState, setShowRepliesState] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const isOwner = user?.userId === comment.userId;

  // Format time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
  };

  const handleToggleLike = async () => {
    if (isLiking) return;

    if (!user) {
      Alert.alert(t("alerts.authRequired"), t("comments.signInToLike"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("auth.signIn"), onPress: () => router.push("/welcome") },
      ]);
      return;
    }

    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? Math.max(0, likeCount - 1) : likeCount + 1);

    try {
      setIsLiking(true);
      const newIsLiked = await commentService.toggleCommentLike(
        comment.commentId,
        isLiked
      );

      if (onLikeChange) {
        onLikeChange(
          comment.commentId,
          newIsLiked,
          isLiked ? previousCount - 1 : previousCount + 1
        );
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);

      if (error instanceof Error && error.message.includes("Session expired")) {
        await logout();
        router.replace("/welcome");
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : t("alerts.tryAgain");
      Alert.alert(t("alerts.error"), errorMessage);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("comments.deleteTitle"), t("comments.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await commentService.deleteComment(comment.commentId);
            if (onDelete) {
              onDelete(comment.commentId);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : t("alerts.tryAgain");
            Alert.alert(t("alerts.error"), errorMessage);
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      Alert.alert(t("alerts.error"), t("comments.emptyComment"));
      return;
    }

    try {
      await commentService.updateComment(comment.commentId, {
        content: editContent.trim(),
      });
      if (onUpdate) {
        onUpdate(comment.commentId, editContent.trim());
      }
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("alerts.tryAgain");
      Alert.alert(t("alerts.error"), errorMessage);
    }
  };

  const loadReplies = async () => {
    if (replies.length > 0 || isLoadingReplies) {
      setShowRepliesState(!showRepliesState);
      return;
    }

    try {
      setIsLoadingReplies(true);
      const response = await commentService.getCommentReplies(
        comment.commentId
      );
      setReplies(response.items);
      setShowRepliesState(true);
    } catch (error) {
      console.error("Error loading replies:", error);
      Alert.alert(t("alerts.error"), t("comments.failedToLoadReplies"));
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Max nesting depth
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <View style={[styles.container, depth > 0 && styles.replyContainer]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {comment.userProfileImage ? (
            <Image
              source={comment.userProfileImage}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={16} color="#999" />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{comment.userName}</Text>
            <Text style={styles.timestamp}>
              {getTimeAgo(comment.createdAt)}
            </Text>
          </View>
        </View>

        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons name="create-outline" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 12 }}>
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButton}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={styles.saveButton}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.content}>{comment.content}</Text>
      )}

      {comment.updatedAt && !isEditing && (
        <Text style={styles.edited}>{t("comments.edited")}</Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleToggleLike}
          disabled={isLiking}
          style={styles.likeButton}
        >
          {isLiking ? (
            <ActivityIndicator size="small" color="#FF6B9D" />
          ) : (
            <>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={16}
                color={isLiked ? "#FF6B9D" : "#666"}
              />
              {likeCount > 0 && (
                <Text
                  style={[styles.likeCount, isLiked && styles.likeCountActive]}
                >
                  {likeCount}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {!isMaxDepth && onReply && (
          <TouchableOpacity
            onPress={() => onReply(comment.commentId, comment.userName)}
            style={styles.replyButton}
          >
            <Ionicons name="arrow-undo-outline" size={16} color="#666" />
            <Text style={styles.replyText}>{t("comments.reply")}</Text>
          </TouchableOpacity>
        )}

        {comment.replyCount > 0 && showReplies && (
          <TouchableOpacity
            onPress={loadReplies}
            style={styles.viewRepliesButton}
          >
            <Text style={styles.viewRepliesText}>
              {showRepliesState
                ? t("comments.hideReplies")
                : t("comments.viewReplies", { count: comment.replyCount })}
            </Text>
            {isLoadingReplies && (
              <ActivityIndicator size="small" color="#666" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {showRepliesState && replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onLikeChange={onLikeChange}
              depth={depth + 1}
              showReplies={showReplies}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  replyContainer: {
    marginLeft: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e0e0",
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  edited: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    minHeight: 60,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  saveButton: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  likeCountActive: {
    color: "#FF6B9D",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  viewRepliesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewRepliesText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "600",
  },
  repliesContainer: {
    marginTop: 8,
  },
});
