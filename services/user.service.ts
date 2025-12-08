import { Bird } from "@/types/bird";
import { UpdateUserDto, UserProfile } from "@/types/user";
import { apiHelper } from "./api-helper";

const USER_ENDPOINT = "/api/users";

export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiHelper.get<UserProfile>(
        `${USER_ENDPOINT}/${userId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    data: UpdateUserDto
  ): Promise<UserProfile> {
    try {
      const response = await apiHelper.put<UserProfile>(
        `${USER_ENDPOINT}/${userId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Get loved birds
  async getLovedBirds(userId: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(
        `${USER_ENDPOINT}/${userId}/loved-birds`
      );
      return response;
    } catch (error) {
      console.error("Error fetching loved birds:", error);
      return [];
    }
  },

  // Get supported birds
  async getSupportedBirds(userId: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(
        `${USER_ENDPOINT}/${userId}/supported-birds`
      );
      return response;
    } catch (error) {
      console.error("Error fetching supported birds:", error);
      return [];
    }
  },

  // Get owned birds
  async getOwnedBirds(userId: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(
        `${USER_ENDPOINT}/${userId}/owned-birds`
      );
      return response;
    } catch (error) {
      console.error("Error fetching owned birds:", error);
      return [];
    }
  },
};
