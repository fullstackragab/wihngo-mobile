/**
 * Like Service
 * Handles all story like operations
 * Based on Backend API Documentation v1.0
 */

import {
  LIKES_PAGE_SIZE,
  LikeStoryRequest,
  StoryLike,
  StoryLikesResponse,
  StoryLikeStatus,
} from "@/types/like-comment";
import { apiHelper } from "./api-helper";

const LIKES_ENDPOINT = "/api/likes";

export const likeService = {
  /**
   * Get all likes for a specific story with pagination
   * @param storyId - UUID of the story
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 50, max: 100)
   * @returns Paginated response with story likes
   */
  async getStoryLikes(
    storyId: string,
    page: number = 1,
    pageSize: number = LIKES_PAGE_SIZE
  ): Promise<StoryLikesResponse> {
    try {
      const response = await apiHelper.get<StoryLikesResponse>(
        `${LIKES_ENDPOINT}/story/${storyId}?page=${page}&pageSize=${pageSize}`
      );
      console.log(
        `✅ Fetched ${response.items.length} likes for story ${storyId}`
      );
      return response;
    } catch (error) {
      console.error(`❌ Error fetching story likes:`, error);
      throw error;
    }
  },

  /**
   * Like a story
   * @param storyId - UUID of the story to like
   * @returns The created like object
   */
  async likeStory(storyId: string): Promise<StoryLike> {
    try {
      const payload: LikeStoryRequest = { storyId };
      const response = await apiHelper.post<StoryLike>(
        `${LIKES_ENDPOINT}/story`,
        payload
      );
      console.log(`✅ Liked story ${storyId}`);
      return response;
    } catch (error: any) {
      // Handle 409 Conflict (already liked)
      if (error?.status === 409) {
        console.warn(`⚠️ Story ${storyId} already liked`);
        throw new Error("You have already liked this story");
      }
      console.error(`❌ Error liking story:`, error);
      throw error;
    }
  },

  /**
   * Unlike a story
   * @param storyId - UUID of the story to unlike
   */
  async unlikeStory(storyId: string): Promise<void> {
    try {
      await apiHelper.delete(`${LIKES_ENDPOINT}/story/${storyId}`);
      console.log(`✅ Unliked story ${storyId}`);
    } catch (error) {
      console.error(`❌ Error unliking story:`, error);
      throw error;
    }
  },

  /**
   * Check if the current user has liked a specific story
   * Requires authentication
   * @param storyId - UUID of the story
   * @returns Like status with details
   */
  async checkStoryLikeStatus(storyId: string): Promise<StoryLikeStatus> {
    try {
      const response = await apiHelper.get<StoryLikeStatus>(
        `${LIKES_ENDPOINT}/story/${storyId}/check`
      );
      console.log(
        `✅ Checked like status for story ${storyId}:`,
        response.isLiked
      );
      return response;
    } catch (error) {
      console.error(`❌ Error checking like status:`, error);
      throw error;
    }
  },

  /**
   * Get all stories liked by the current user
   * Requires authentication
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20, max: 100)
   * @returns Paginated response with liked stories
   */
  async getMyLikedStories(
    page: number = 1,
    pageSize: number = 20
  ): Promise<StoryLikesResponse> {
    try {
      const response = await apiHelper.get<StoryLikesResponse>(
        `${LIKES_ENDPOINT}/my-likes?page=${page}&pageSize=${pageSize}`
      );
      console.log(`✅ Fetched ${response.items.length} liked stories`);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching liked stories:`, error);
      throw error;
    }
  },

  /**
   * Toggle like on a story (like if not liked, unlike if liked)
   * Optimized method for UI interactions
   * @param storyId - UUID of the story
   * @param currentlyLiked - Current like status
   * @returns New like status (true if now liked, false if now unliked)
   */
  async toggleStoryLike(
    storyId: string,
    currentlyLiked: boolean
  ): Promise<boolean> {
    try {
      if (currentlyLiked) {
        await this.unlikeStory(storyId);
        return false;
      } else {
        await this.likeStory(storyId);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error toggling story like:`, error);
      throw error;
    }
  },
};
