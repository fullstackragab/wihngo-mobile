import { Bird } from "@/types/bird";
import Constants from "expo-constants";

const url =
  Constants.expoConfig?.extra?.apiUrl || "https://wihngo-api.onrender.com/api/";

export async function getBirdsService(): Promise<Bird[]> {
  try {
    const response = await fetch(`${url}birds`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch birds: ${response.statusText}`);
    }

    const data = await response.json();

    // Remove duplicates by birdId
    const uniqueBirds = Array.from(
      new Map(data.map((b: Bird) => [b.birdId, b])).values()
    );

    return uniqueBirds as Bird[];
  } catch (error) {
    console.error("Error fetching birds:", error);
    throw error;
  }
}

export async function getBirdByIdService(birdId: string): Promise<Bird> {
  try {
    const response = await fetch(`${url}birds/${birdId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bird: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching bird:", error);
    throw error;
  }
}
