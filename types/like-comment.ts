/**
 * Types for Like and Comment System
 * Based on Backend API Documentation v1.0
 */

// ==================== STORY LIKES ====================

/**
 * Story Like entity
 */
export type StoryLike = {
  likeId: string;
  storyId: string;
  userId: string;
  userName: string;
  userProfileImage?: string | null;
  createdAt: string; // ISO 8601 format
};

/**
 * Paginated response for story likes
 */
export type StoryLikesResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: StoryLike[];
};

/**
 * Request payload to like a story
 */
export type LikeStoryRequest = {
  storyId: string;
};

/**
 * Response for checking if user liked a story
 */
export type StoryLikeStatus = {
  isLiked: boolean;
  likeId: string | null;
  createdAt: string | null;
};

// ==================== COMMENTS ====================

/**
 * Comment entity with nested reply support
 */
export type Comment = {
  commentId: string;
  storyId: string;
  userId: string;
  userName: string;
  userProfileImage?: string | null;
  content: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string | null;
  parentCommentId: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replyCount: number;
  replies?: Comment[]; // Only included when fetching single comment with replies
};

/**
 * Paginated response for comments
 */
export type CommentsResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Comment[];
};

/**
 * Request payload to create a comment or reply
 */
export type CreateCommentRequest = {
  storyId: string;
  content: string; // Max 2000 characters
  parentCommentId?: string | null; // If provided, creates a reply
};

/**
 * Request payload to update a comment
 */
export type UpdateCommentRequest = {
  content: string; // Max 2000 characters
};

// ==================== COMMENT LIKES ====================

/**
 * Comment Like entity
 */
export type CommentLike = {
  likeId: string;
  commentId: string;
  userId: string;
  userName: string;
  userProfileImage?: string | null;
  createdAt: string; // ISO 8601 format
};

/**
 * Paginated response for comment likes
 */
export type CommentLikesResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentLike[];
};

// ==================== CONSTANTS ====================

/**
 * Validation constants
 */
export const COMMENT_MAX_LENGTH = 2000;
export const DEFAULT_PAGE_SIZE = 20;
export const COMMENTS_PAGE_SIZE = 20;
export const LIKES_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
