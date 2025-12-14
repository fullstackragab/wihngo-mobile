/**
 * CommentList Component
 * Displays paginated list of comments with input for new comments
 */

import { useAuth } from "@/contexts/auth-context";
import { commentService } from "@/services/comment.service";
import { Comment } from "@/types/like-comment";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CommentInput from "./comment-input";
import CommentItem from "./comment-item";

interface CommentListProps {
  storyId: string;
  pageSize?: number;
  showInput?: boolean;
  onCommentCountChange?: (newCount: number) => void;
}

export default function CommentList({
  storyId,
  pageSize = 20,
  showInput = true,
  onCommentCountChange,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
  } | null>(null);

  const { user } = useAuth();

  // Load comments
  const loadComments = useCallback(
    async (pageNum: number, refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else if (pageNum === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await commentService.getStoryComments(
          storyId,
          pageNum,
          pageSize
        );

        if (pageNum === 1) {
          setComments(response.items);
        } else {
          setComments((prev) => [...prev, ...response.items]);
        }

        setTotalCount(response.totalCount);
        setHasMore(response.items.length === pageSize);
        setPage(pageNum);

        if (onCommentCountChange && pageNum === 1) {
          onCommentCountChange(response.totalCount);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        Alert.alert("Error", "Failed to load comments");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [storyId, pageSize, onCommentCountChange]
  );

  // Initial load
  useEffect(() => {
    loadComments(1);
  }, [storyId, loadComments]);

  // Refresh comments
  const handleRefresh = () => {
    loadComments(1, true);
  };

  // Load more comments
  const handleLoadMore = () => {
    if (!isLoadingMore && !isLoading && hasMore) {
      loadComments(page + 1);
    }
  };

  // Submit new comment
  const handleSubmitComment = async (content: string) => {
    if (!user) {
      Alert.alert("Authentication Required", "Please sign in to comment");
      return;
    }

    try {
      const newComment = await commentService.createComment({
        storyId,
        content,
        parentCommentId: replyingTo?.commentId || null,
      });

      if (replyingTo) {
        // If it's a reply, update the parent comment's reply count
        setComments((prev) =>
          prev.map((comment) =>
            comment.commentId === replyingTo.commentId
              ? {
                  ...comment,
                  replyCount: comment.replyCount + 1,
                }
              : comment
          )
        );
        setReplyingTo(null);
      } else {
        // If it's a top-level comment, add it to the list
        setComments((prev) => [newComment, ...prev]);
        setTotalCount((prev) => prev + 1);

        if (onCommentCountChange) {
          onCommentCountChange(totalCount + 1);
        }
      }
    } catch (error) {
      throw error; // Let CommentInput handle the error
    }
  };

  // Handle reply action
  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo({ commentId, userName });
  };

  // Handle comment deletion
  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    if (onCommentCountChange) {
      onCommentCountChange(Math.max(0, totalCount - 1));
    }
  };

  // Handle comment update
  const handleUpdateComment = (commentId: string, newContent: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? {
              ...comment,
              content: newContent,
              updatedAt: new Date().toISOString(),
            }
          : comment
      )
    );
  };

  // Handle like change
  const handleLikeChange = (
    commentId: string,
    isLiked: boolean,
    newCount: number
  ) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? { ...comment, isLikedByCurrentUser: isLiked, likeCount: newCount }
          : comment
      )
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No comments yet. Be the first to comment!
        </Text>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Comments {totalCount > 0 && `(${totalCount})`}
            </Text>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.commentId}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
                onLikeChange={handleLikeChange}
              />
            )}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#4A90E2"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={
              comments.length === 0 ? styles.emptyList : undefined
            }
          />

          {showInput && (
            <CommentInput
              onSubmit={handleSubmitComment}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.userName}...`
                  : "Add a comment..."
              }
              replyingTo={replyingTo?.userName || null}
              onCancelReply={() => setReplyingTo(null)}
              autoFocus={!!replyingTo}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
