import {
  CreateStoryDto,
  Story,
  StoryComment,
  StoryDetailDto,
} from "@/types/story";
import { apiHelper } from "./api-helper";

const STORIES_ENDPOINT = "/api/stories";

export const storyService = {
  // Get all stories
  async getStories(): Promise<Story[]> {
    try {
      const response = await apiHelper.get<Story[]>(STORIES_ENDPOINT);
      return response;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  },

  // Get trending stories
  async getTrendingStories(): Promise<Story[]> {
    try {
      const response = await apiHelper.get<Story[]>(
        `${STORIES_ENDPOINT}/trending`
      );
      return response;
    } catch (error) {
      console.error("Error fetching trending stories:", error);
      throw error;
    }
  },

  // Get story detail
  async getStoryDetail(storyId: string): Promise<StoryDetailDto> {
    try {
      const response = await apiHelper.get<StoryDetailDto>(
        `${STORIES_ENDPOINT}/${storyId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching story detail:", error);
      throw error;
    }
  },

  // Create story
  async createStory(data: CreateStoryDto): Promise<Story> {
    try {
      const response = await apiHelper.post<Story>(STORIES_ENDPOINT, data);
      return response;
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  },

  // Like story
  async likeStory(storyId: string): Promise<void> {
    try {
      await apiHelper.post(`${STORIES_ENDPOINT}/${storyId}/like`, {
        like: true,
      });
    } catch (error) {
      console.error("Error liking story:", error);
      throw error;
    }
  },

  // Unlike story
  async unlikeStory(storyId: string): Promise<void> {
    try {
      await apiHelper.delete(`${STORIES_ENDPOINT}/${storyId}/like`);
    } catch (error) {
      console.error("Error unliking story:", error);
      throw error;
    }
  },

  // Add comment
  async addComment(storyId: string, content: string): Promise<StoryComment> {
    try {
      const response = await apiHelper.post<StoryComment>(
        `${STORIES_ENDPOINT}/${storyId}/comments`,
        { content }
      );
      return response;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Get bird stories
  async getBirdStories(birdId: string): Promise<Story[]> {
    try {
      const response = await apiHelper.get<Story[]>(
        `${STORIES_ENDPOINT}/bird/${birdId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching bird stories:", error);
      throw error;
    }
  },

  // Get user stories
  async getUserStories(userId: string): Promise<Story[]> {
    try {
      const response = await apiHelper.get<Story[]>(
        `${STORIES_ENDPOINT}/user/${userId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user stories:", error);
      throw error;
    }
  },
};
