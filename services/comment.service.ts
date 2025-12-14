/**
 * Comment Service
 * Handles all comment and comment like operations
 * Based on Backend API Documentation v1.0
 */

import {
  Comment,
  CommentLike,
  CommentLikesResponse,
  COMMENTS_PAGE_SIZE,
  CommentsResponse,
  CreateCommentRequest,
  LIKES_PAGE_SIZE,
  UpdateCommentRequest,
} from "@/types/like-comment";
import { apiHelper } from "./api-helper";

const COMMENTS_ENDPOINT = "/api/comments";

export const commentService = {
  // ==================== COMMENT OPERATIONS ====================

  /**
   * Get all top-level comments for a story (does not include replies)
   * @param storyId - UUID of the story
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20, max: 100)
   * @returns Paginated response with comments
   */
  async getStoryComments(
    storyId: string,
    page: number = 1,
    pageSize: number = COMMENTS_PAGE_SIZE
  ): Promise<CommentsResponse> {
    try {
      const response = await apiHelper.get<CommentsResponse>(
        `${COMMENTS_ENDPOINT}/story/${storyId}?page=${page}&pageSize=${pageSize}`
      );
      console.log(
        `✅ Fetched ${response.items.length} comments for story ${storyId}`
      );
      return response;
    } catch (error) {
      console.error(`❌ Error fetching story comments:`, error);
      throw error;
    }
  },

  /**
   * Get a single comment with all its nested replies
   * @param commentId - UUID of the comment
   * @returns Comment with nested replies
   */
  async getCommentWithReplies(commentId: string): Promise<Comment> {
    try {
      const response = await apiHelper.get<Comment>(
        `${COMMENTS_ENDPOINT}/${commentId}`
      );
      console.log(`✅ Fetched comment ${commentId} with replies`);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching comment with replies:`, error);
      throw error;
    }
  },

  /**
   * Get replies for a specific comment with pagination
   * @param commentId - UUID of the parent comment
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20, max: 100)
   * @returns Paginated response with replies
   */
  async getCommentReplies(
    commentId: string,
    page: number = 1,
    pageSize: number = COMMENTS_PAGE_SIZE
  ): Promise<CommentsResponse> {
    try {
      const response = await apiHelper.get<CommentsResponse>(
        `${COMMENTS_ENDPOINT}/${commentId}/replies?page=${page}&pageSize=${pageSize}`
      );
      console.log(
        `✅ Fetched ${response.items.length} replies for comment ${commentId}`
      );
      return response;
    } catch (error) {
      console.error(`❌ Error fetching comment replies:`, error);
      throw error;
    }
  },

  /**
   * Create a new comment on a story or reply to an existing comment
   * Requires authentication
   * @param data - Comment data (storyId, content, optional parentCommentId)
   * @returns The created comment
   */
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    try {
      // Validate content
      if (!data.content || data.content.trim().length === 0) {
        throw new Error("Comment content cannot be empty");
      }
      if (data.content.length > 2000) {
        throw new Error("Comment content cannot exceed 2000 characters");
      }

      const response = await apiHelper.post<Comment>(
        `${COMMENTS_ENDPOINT}`,
        data
      );

      const commentType = data.parentCommentId ? "reply" : "comment";
      console.log(`✅ Created ${commentType} on story ${data.storyId}`);
      return response;
    } catch (error: any) {
      if (error?.status === 400) {
        console.error(`❌ Invalid comment data:`, error);
        throw new Error("Invalid comment data. Please check your input.");
      }
      if (error?.status === 404) {
        console.error(`❌ Story or parent comment not found:`, error);
        throw new Error("Story or parent comment not found");
      }
      console.error(`❌ Error creating comment:`, error);
      throw error;
    }
  },

  /**
   * Update an existing comment's content
   * Requires authentication and ownership
   * @param commentId - UUID of the comment
   * @param data - Updated content
   */
  async updateComment(
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<void> {
    try {
      // Validate content
      if (!data.content || data.content.trim().length === 0) {
        throw new Error("Comment content cannot be empty");
      }
      if (data.content.length > 2000) {
        throw new Error("Comment content cannot exceed 2000 characters");
      }

      await apiHelper.put(`${COMMENTS_ENDPOINT}/${commentId}`, data);
      console.log(`✅ Updated comment ${commentId}`);
    } catch (error: any) {
      if (error?.status === 403) {
        console.error(`❌ Not authorized to edit comment:`, error);
        throw new Error("You can only edit your own comments");
      }
      if (error?.status === 404) {
        console.error(`❌ Comment not found:`, error);
        throw new Error("Comment not found");
      }
      console.error(`❌ Error updating comment:`, error);
      throw error;
    }
  },

  /**
   * Delete a comment and all its replies (cascade delete)
   * Requires authentication and ownership
   * @param commentId - UUID of the comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiHelper.delete(`${COMMENTS_ENDPOINT}/${commentId}`);
      console.log(`✅ Deleted comment ${commentId}`);
    } catch (error: any) {
      if (error?.status === 403) {
        console.error(`❌ Not authorized to delete comment:`, error);
        throw new Error("You can only delete your own comments");
      }
      if (error?.status === 404) {
        console.error(`❌ Comment not found:`, error);
        throw new Error("Comment not found");
      }
      console.error(`❌ Error deleting comment:`, error);
      throw error;
    }
  },

  // ==================== COMMENT LIKE OPERATIONS ====================

  /**
   * Get all likes for a specific comment
   * @param commentId - UUID of the comment
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 50, max: 100)
   * @returns Paginated response with comment likes
   */
  async getCommentLikes(
    commentId: string,
    page: number = 1,
    pageSize: number = LIKES_PAGE_SIZE
  ): Promise<CommentLikesResponse> {
    try {
      const response = await apiHelper.get<CommentLikesResponse>(
        `${COMMENTS_ENDPOINT}/${commentId}/likes?page=${page}&pageSize=${pageSize}`
      );
      console.log(
        `✅ Fetched ${response.items.length} likes for comment ${commentId}`
      );
      return response;
    } catch (error) {
      console.error(`❌ Error fetching comment likes:`, error);
      throw error;
    }
  },

  /**
   * Like a comment
   * Requires authentication
   * @param commentId - UUID of the comment to like
   * @returns The created like object
   */
  async likeComment(commentId: string): Promise<CommentLike> {
    try {
      const response = await apiHelper.post<CommentLike>(
        `${COMMENTS_ENDPOINT}/${commentId}/like`,
        {}
      );
      console.log(`✅ Liked comment ${commentId}`);
      return response;
    } catch (error: any) {
      if (error?.status === 409) {
        console.warn(`⚠️ Comment ${commentId} already liked`);
        throw new Error("You have already liked this comment");
      }
      if (error?.status === 404) {
        console.error(`❌ Comment not found:`, error);
        throw new Error("Comment not found");
      }
      console.error(`❌ Error liking comment:`, error);
      throw error;
    }
  },

  /**
   * Unlike a comment
   * Requires authentication
   * @param commentId - UUID of the comment to unlike
   */
  async unlikeComment(commentId: string): Promise<void> {
    try {
      await apiHelper.delete(`${COMMENTS_ENDPOINT}/${commentId}/like`);
      console.log(`✅ Unliked comment ${commentId}`);
    } catch (error) {
      console.error(`❌ Error unliking comment:`, error);
      throw error;
    }
  },

  /**
   * Toggle like on a comment (like if not liked, unlike if liked)
   * Optimized method for UI interactions
   * @param commentId - UUID of the comment
   * @param currentlyLiked - Current like status
   * @returns New like status (true if now liked, false if now unliked)
   */
  async toggleCommentLike(
    commentId: string,
    currentlyLiked: boolean
  ): Promise<boolean> {
    try {
      if (currentlyLiked) {
        await this.unlikeComment(commentId);
        return false;
      } else {
        await this.likeComment(commentId);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error toggling comment like:`, error);
      throw error;
    }
  },
};
