import {
  CreateStoryDto,
  GenerateStoryRequest,
  GenerateStoryResponse,
  Story,
  StoryComment,
  StoryDetailDto,
  StoryListResponse,
  UpdateStoryDto,
} from "@/types/story";
import { apiHelper } from "./api-helper";

const STORIES_ENDPOINT = "/api/stories";

export const storyService = {
  /**
   * Get all stories (paginated)
   * @param page - Page number (1-based)
   * @param pageSize - Items per page (default: 10)
   * @returns Paginated response with items, totalCount, page, pageSize
   */
  async getStories(
    page: number = 1,
    pageSize: number = 10
  ): Promise<StoryListResponse> {
    try {
      const response = await apiHelper.get<StoryListResponse>(
        `${STORIES_ENDPOINT}?page=${page}&pageSize=${pageSize}`
      );
      console.log(`✅ Fetched ${response.items.length} stories (page ${page})`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching stories:", error);
      // Return empty paginated response on error
      return {
        page: 1,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }
  },

  /**
   * Get story detail by ID
   * @param storyId - Story GUID
   * @returns Full story detail with content, birds, and author
   */
  async getStoryDetail(storyId: string): Promise<StoryDetailDto> {
    try {
      const response = await apiHelper.get<StoryDetailDto>(
        `${STORIES_ENDPOINT}/${storyId}`
      );
      console.log(`✅ Fetched story detail: ${storyId}`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching story detail:", error);
      throw error;
    }
  },

  /**
   * Get stories by user ID (paginated)
   * @param userId - User GUID
   * @param page - Page number (1-based)
   * @param pageSize - Items per page (default: 10)
   * @returns Paginated response with user's stories
   */
  async getUserStories(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<StoryListResponse> {
    try {
      const response = await apiHelper.get<StoryListResponse>(
        `${STORIES_ENDPOINT}/user/${userId}?page=${page}&pageSize=${pageSize}`
      );
      console.log(`✅ Fetched user stories for ${userId} (page ${page})`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching user stories:", error);
      return {
        page: 1,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }
  },

  /**
   * Get current authenticated user's stories (paginated)
   * @param page - Page number (1-based)
   * @param pageSize - Items per page (default: 10)
   * @returns Paginated response with current user's stories
   */
  async getMyStories(
    page: number = 1,
    pageSize: number = 10
  ): Promise<StoryListResponse> {
    try {
      const response = await apiHelper.get<StoryListResponse>(
        `${STORIES_ENDPOINT}/my-stories?page=${page}&pageSize=${pageSize}`
      );
      console.log(`✅ Fetched my stories (page ${page})`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching my stories:", error);
      return {
        page: 1,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }
  },

  /**
   * Create a new story
   * @param data - Story content, bird IDs, optional mood and media
   * @returns Created story detail
   * @throws Error if validation fails (no content, no birds, or both media types)
   */
  async createStory(data: CreateStoryDto): Promise<StoryDetailDto> {
    try {
      const response = await apiHelper.post<StoryDetailDto>(
        STORIES_ENDPOINT,
        data
      );
      console.log("✅ Story created successfully");
      return response;
    } catch (error) {
      console.error("❌ Error creating story:", error);
      throw error;
    }
  },

  /**
   * Update an existing story (partial updates supported)
   * @param storyId - Story GUID
   * @param data - Fields to update (all optional)
   * @throws Error if user is not the author (403) or story not found (404)
   */
  async updateStory(storyId: string, data: UpdateStoryDto): Promise<void> {
    try {
      // API returns 204 No Content on success
      await apiHelper.put(`${STORIES_ENDPOINT}/${storyId}`, data);
      console.log("✅ Story updated successfully");
    } catch (error) {
      console.error("❌ Error updating story:", error);
      throw error;
    }
  },

  /**
   * Delete a story
   * @param storyId - Story GUID
   * @throws Error if user is not the author (403) or story not found (404)
   * Note: Automatically deletes associated media files from S3
   */
  async deleteStory(storyId: string): Promise<void> {
    try {
      // API returns 204 No Content on success
      await apiHelper.delete(`${STORIES_ENDPOINT}/${storyId}`);
      console.log(
        "✅ Story deleted successfully (media files removed from S3)"
      );
    } catch (error) {
      console.error("❌ Error deleting story:", error);
      throw error;
    }
  },

  /**
   * Generate AI story content based on bird profile, mood, and media
   * @param data - Bird ID, optional mood, and optional media S3 keys
   * @returns Generated story content
   * @throws Error if bird not found, not owned, or rate limit exceeded
   */
  async generateStoryContent(
    data: GenerateStoryRequest
  ): Promise<GenerateStoryResponse> {
    try {
      const response = await apiHelper.post<GenerateStoryResponse>(
        `${STORIES_ENDPOINT}/generate`,
        data
      );
      console.log("✅ AI story content generated successfully");
      return response;
    } catch (error) {
      console.error("❌ Error generating AI story content:", error);
      throw error;
    }
  },

  /**
   * Transcribe audio to text using OpenAI Whisper API
   * @param audioS3Key - S3 key of the uploaded audio file
   * @param language - Optional language code hint (e.g., "en", "ar") for better accuracy
   * @returns Transcribed text and metadata
   * @throws Error if audio not found or transcription fails
   */
  async transcribeAudio(audioS3Key: string, language?: string): Promise<{
    transcribedText: string;
    transcriptionId: string;
    language?: string;
  }> {
    try {
      const response = await apiHelper.post<{
        transcribedText: string;
        transcriptionId: string;
        language?: string;
      }>(`${STORIES_ENDPOINT}/transcribe`, {
        audioS3Key,
        language: language || undefined
      });
      console.log("✅ Audio transcribed successfully");
      return response;
    } catch (error) {
      console.error("❌ Error transcribing audio:", error);
      throw error;
    }
  },

  // ========== FEATURES NOT YET IMPLEMENTED BY BACKEND ==========
  // The following methods are placeholders for future implementation

  /**
   * Like a story (NOT YET IMPLEMENTED)
   * @deprecated This endpoint is not available yet
   */
  async likeStory(storyId: string): Promise<void> {
    console.warn("⚠️ Like functionality not yet implemented by backend");
    throw new Error("Like functionality not yet implemented");
  },

  /**
   * Unlike a story (NOT YET IMPLEMENTED)
   * @deprecated This endpoint is not available yet
   */
  async unlikeStory(storyId: string): Promise<void> {
    console.warn("⚠️ Unlike functionality not yet implemented by backend");
    throw new Error("Unlike functionality not yet implemented");
  },

  /**
   * Add a comment to a story (NOT YET IMPLEMENTED)
   * @deprecated This endpoint is not available yet
   */
  async addComment(storyId: string, content: string): Promise<StoryComment> {
    console.warn("⚠️ Comment functionality not yet implemented by backend");
    throw new Error("Comment functionality not yet implemented");
  },

  /**
   * Get stories by bird ID (NOT YET IMPLEMENTED)
   * @deprecated This endpoint is not available yet - use getUserStories instead
   */
  async getBirdStories(birdId: string): Promise<Story[]> {
    console.warn("⚠️ Bird stories endpoint not yet implemented by backend");
    throw new Error("Bird stories endpoint not yet implemented");
  },
};
