import {
  SupportTransaction,
  SupportTransactionCreateDto,
} from "@/types/support";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Helper to replace localhost with appropriate IP for Android emulator
const getApiUrl = () => {
  let apiUrl =
    Constants.expoConfig?.extra?.apiUrl ||
    "https://wihngo-api.onrender.com/api/";

  // Replace localhost with 10.0.2.2 for Android emulator
  if (Platform.OS === "android" && apiUrl.includes("localhost")) {
    apiUrl = apiUrl.replace("localhost", "10.0.2.2");
  }

  return apiUrl;
};

const API_URL = getApiUrl();

/**
 * Create a new support transaction
 */
export async function createSupportTransaction(
  transaction: SupportTransactionCreateDto
): Promise<SupportTransaction> {
  try {
    const endpoint = `${API_URL}supporttransactions`;
    console.log("Creating support transaction at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(transaction),
    });

    console.log("Support transaction response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Support transaction error:", errorText);
      throw new Error(
        `Failed to create support transaction: ${response.status} ${response.statusText}`
      );
    }

    const data: SupportTransaction = await response.json();
    console.log("Support transaction created successfully");

    return data;
  } catch (error) {
    console.error("Error creating support transaction:", error);
    throw error;
  }
}

/**
 * Get all support transactions
 */
export async function getSupportTransactions(): Promise<SupportTransaction[]> {
  try {
    const endpoint = `${API_URL}supporttransactions`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch support transactions: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching support transactions:", error);
    throw error;
  }
}

/**
 * Get a specific support transaction by ID
 */
export async function getSupportTransactionById(
  id: string
): Promise<SupportTransaction> {
  try {
    const endpoint = `${API_URL}supporttransactions/${id}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch support transaction: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching support transaction:", error);
    throw error;
  }
}
