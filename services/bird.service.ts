// Import Constants from expo-constants
import {
  Bird,
  BirdHealthLog,
  CreateBirdDto,
  SupportBirdDto,
  UpdateBirdDto,
} from "@/types/bird";
import Constants from "expo-constants";
import { apiHelper } from "./api-helper";

// Read the value from the 'extra' field defined in app.config.js
// TypeScript users may need 'as any' if their Constants type isn't fully defined.
const API_URL = Constants.expoConfig?.extra?.apiUrl;

export async function getBirdsService(): Promise<Bird[]> {
  try {
    const endpoint = `${API_URL}birds`;
    console.log("Final URL:", API_URL);
    console.log("Fetching birds from:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    //console.log("Response headers:", JSON.stringify(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to fetch birds: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Birds data received:", data?.length || 0, "items");

    // Log first bird to check supportedBy field
    if (data && data.length > 0) {
      console.log("First bird sample:", {
        birdId: data[0].birdId,
        name: data[0].name,
        lovedBy: data[0].lovedBy,
        supportedBy: data[0].supportedBy,
        totalSupport: data[0].totalSupport,
      });

      // NOTE: If supportedBy is 0 for all birds, this is a backend issue.
      // The backend needs to calculate and return the support count by:
      // 1. Counting support transactions for each bird
      // 2. Aggregating the support data in the GET /birds endpoint
      // 3. Ensuring the supportedBy field is populated correctly
    }

    // Remove duplicates by birdId
    const uniqueBirds = Array.from(
      new Map(data.map((b: Bird) => [b.birdId, b])).values()
    );

    return uniqueBirds as Bird[];
  } catch (error) {
    console.error("Error fetching birds - Full error:", error);
    console.error("Error name:", (error as Error)?.name);
    console.error("Error message:", (error as Error)?.message);
    throw error;
  }
}

export async function getBirdByIdService(birdId: string): Promise<Bird> {
  try {
    console.log(
      `Fetching bird with ID: ${birdId} from ${API_URL}birds/${birdId}`
    );
    const response = await fetch(`${API_URL}birds/${birdId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bird: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize field names - API might return commonName/scientificName
    if (data.commonName && !data.name) {
      data.name = data.commonName;
    }
    if (data.scientificName && !data.species) {
      data.species = data.scientificName;
    }

    // Check image field
    console.log("Image URL from API:", data.imageUrl);
    console.log("All data keys:", Object.keys(data));

    return data;
  } catch (error) {
    console.error("Error fetching bird:", error);
    throw error;
  }
}

// Additional bird service methods
export const birdService = {
  // Get all birds
  async getBirds(): Promise<Bird[]> {
    return getBirdsService();
  },

  // Get bird by ID
  async getBirdById(birdId: string): Promise<Bird> {
    return getBirdByIdService(birdId);
  },

  // Get featured birds
  async getFeaturedBirds(): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(`${API_URL}birds/featured`);
      return response;
    } catch (error) {
      console.error("Error fetching featured birds:", error);
      return [];
    }
  },

  // Get recently supported birds
  async getRecentlySupported(): Promise<Bird[]> {
    try {
      const response = await apiHelper.get<Bird[]>(
        `${API_URL}birds/recently-supported`
      );
      return response;
    } catch (error) {
      console.error("Error fetching recently supported birds:", error);
      return [];
    }
  },

  // Create bird (automatically associates with authenticated user)
  async createBird(data: CreateBirdDto): Promise<Bird> {
    try {
      console.log("Creating bird with data:", data);
      const response = await apiHelper.post<Bird>(`/api/birds`, data);
      console.log("Bird created successfully:", response);
      return response;
    } catch (error) {
      console.error("Error creating bird:", error);
      throw error;
    }
  },

  // Update bird
  async updateBird(birdId: string, data: UpdateBirdDto): Promise<Bird> {
    try {
      const response = await apiHelper.put<Bird>(
        `${API_URL}birds/${birdId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating bird:", error);
      throw error;
    }
  },

  // Delete bird
  async deleteBird(birdId: string): Promise<void> {
    try {
      await apiHelper.delete(`${API_URL}birds/${birdId}`);
    } catch (error) {
      console.error("Error deleting bird:", error);
      throw error;
    }
  },

  // Love bird
  async loveBird(birdId: string): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}birds/${birdId}/love`);
    } catch (error) {
      console.error("Error loving bird:", error);
      throw error;
    }
  },

  // Unlove bird
  async unloveBird(birdId: string): Promise<void> {
    try {
      await apiHelper.delete(`${API_URL}birds/${birdId}/love`);
    } catch (error) {
      console.error("Error unloving bird:", error);
      throw error;
    }
  },

  // Support bird
  async supportBird(data: SupportBirdDto): Promise<void> {
    try {
      await apiHelper.post(`${API_URL}birds/${data.birdId}/support`, data);
    } catch (error) {
      console.error("Error supporting bird:", error);
      throw error;
    }
  },

  // Get bird health logs
  async getBirdHealthLogs(birdId: string): Promise<BirdHealthLog[]> {
    try {
      const response = await apiHelper.get<BirdHealthLog[]>(
        `${API_URL}birds/${birdId}/health-logs`
      );
      return response;
    } catch (error) {
      console.error("Error fetching health logs:", error);
      return [];
    }
  },

  // Add health log
  async addHealthLog(
    birdId: string,
    data: Omit<BirdHealthLog, "logId" | "createdAt">
  ): Promise<BirdHealthLog> {
    try {
      const response = await apiHelper.post<BirdHealthLog>(
        `${API_URL}birds/${birdId}/health-logs`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error adding health log:", error);
      throw error;
    }
  },
};
