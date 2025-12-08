import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import { User } from "@/types/user";
import { apiHelper } from "@/services/api-helper";

const SEARCH_ENDPOINT = "/api/search";

export interface SearchResults {
  birds: Bird[];
  stories: Story[];
  users: User[];
}

export const searchService = {
  // Global search
  async search(query: string): Promise<SearchResults> {
    try {
      const response = await apiHelper.get<SearchResults>(
        `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("Error searching:", error);
      return { birds: [], stories: [], users: [] };
    }
  },

  // Search birds only
  async searchBirds(query: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(
        `${SEARCH_ENDPOINT}/birds?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("Error searching birds:", error);
      return [];
    }
  },

  // Search stories only
  async searchStories(query: string): Promise<Story[]> {
    try {
      const response = await apiHelper.get<Story[]>(
        `${SEARCH_ENDPOINT}/stories?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("Error searching stories:", error);
      return [];
    }
  },

  // Search users only
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await apiHelper.get<User[]>(
        `${SEARCH_ENDPOINT}/users?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },
};
