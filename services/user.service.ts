import { Bird } from "@/types/bird";
import {
  ProfileResponse,
  UpdateProfileDto,
  UpdateUserDto,
  UserProfile,
} from "@/types/user";
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
      const response = await apiHelper.get<any[]>(
        `${USER_ENDPOINT}/${userId}/loved-birds`
      );
      // Normalize bird data - API may return 'id' instead of 'birdId'
      return response.map((bird) => ({
        ...bird,
        birdId: bird.birdId || bird.id,
      }));
    } catch (error) {
      console.error("Error fetching loved birds:", error);
      return [];
    }
  },

  // Get supported birds
  async getSupportedBirds(userId: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<any[]>(
        `${USER_ENDPOINT}/${userId}/supported-birds`
      );
      // Normalize bird data - API may return 'id' instead of 'birdId'
      return response.map((bird) => ({
        ...bird,
        birdId: bird.birdId || bird.id,
      }));
    } catch (error) {
      console.error("Error fetching supported birds:", error);
      return [];
    }
  },

  // Get owned birds
  async getOwnedBirds(userId: string): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<any[]>(
        `${USER_ENDPOINT}/${userId}/owned-birds`
      );
      // Normalize bird data - API may return 'id' instead of 'birdId'
      return response.map((bird) => ({
        ...bird,
        birdId: bird.birdId || bird.id,
      }));
    } catch (error) {
      console.error("Error fetching owned birds:", error);
      return [];
    }
  },

  // Get current user profile (authenticated)
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiHelper.get<ProfileResponse>(
        `${USER_ENDPOINT}/profile`
      );
      return response;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Update current user profile (authenticated)
  async updateProfile(data: UpdateProfileDto): Promise<ProfileResponse> {
    try {
      const response = await apiHelper.put<ProfileResponse>(
        `${USER_ENDPOINT}/profile`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};
