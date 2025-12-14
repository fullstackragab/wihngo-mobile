/**
 * useStoryComments Hook
 * Custom hook for managing story comments with pagination and state management
 */

import { useAuth } from "@/contexts/auth-context";
import { commentService } from "@/services/comment.service";
import { Comment, COMMENTS_PAGE_SIZE } from "@/types/like-comment";
import { useCallback, useEffect, useState } from "react";

interface UseStoryCommentsOptions {
  storyId: string;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseStoryCommentsReturn {
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadComments: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addComment: (
    content: string,
    parentCommentId?: string | null
  ) => Promise<Comment>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

/**
 * Hook to manage story comments with pagination
 */
export function useStoryComments({
  storyId,
  pageSize = COMMENTS_PAGE_SIZE,
  autoLoad = true,
}: UseStoryCommentsOptions): UseStoryCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && storyId) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, autoLoad]);

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await commentService.getStoryComments(
        storyId,
        1,
        pageSize
      );

      setComments(response.items);
      setTotalCount(response.totalCount);
      setCurrentPage(1);
      setHasMore(response.items.length === pageSize);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load comments")
      );
      console.error("Error loading comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const response = await commentService.getStoryComments(
        storyId,
        nextPage,
        pageSize
      );

      setComments((prev) => [...prev, ...response.items]);
      setCurrentPage(nextPage);
      setHasMore(response.items.length === pageSize);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load more comments")
      );
      console.error("Error loading more comments:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [storyId, currentPage, pageSize, isLoadingMore, hasMore]);

  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  const addComment = useCallback(
    async (
      content: string,
      parentCommentId: string | null = null
    ): Promise<Comment> => {
      if (!user) {
        throw new Error("Authentication required");
      }

      const newComment = await commentService.createComment({
        storyId,
        content,
        parentCommentId,
      });

      if (!parentCommentId) {
        // Top-level comment - add to list
        setComments((prev) => [newComment, ...prev]);
        setTotalCount((prev) => prev + 1);
      } else {
        // Reply - update parent comment's reply count
        setComments((prev) =>
          prev.map((comment) =>
            comment.commentId === parentCommentId
              ? { ...comment, replyCount: comment.replyCount + 1 }
              : comment
          )
        );
      }

      return newComment;
    },
    [storyId, user]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<void> => {
      await commentService.updateComment(commentId, { content });

      setComments((prev) =>
        prev.map((comment) =>
          comment.commentId === commentId
            ? {
                ...comment,
                content,
                updatedAt: new Date().toISOString(),
              }
            : comment
        )
      );
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      await commentService.deleteComment(commentId);

      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  return {
    comments,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadComments,
    loadMore,
    refresh,
    addComment,
    updateComment,
    deleteComment,
  };
}
