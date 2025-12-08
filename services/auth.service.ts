import { AuthResponseDto, LoginDto, UserCreateDto } from "@/types/user";
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
 * Register a new user
 */
export async function registerService(
  userData: UserCreateDto
): Promise<AuthResponseDto> {
  try {
    const endpoint = `${API_URL}auth/register`;
    console.log("Registering user at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("Register response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Register error response:", errorText);

      if (response.status === 409) {
        throw new Error("Email already registered");
      }

      throw new Error(
        `Registration failed: ${response.status} ${response.statusText}`
      );
    }

    const data: AuthResponseDto = await response.json();
    console.log("Registration successful");

    return data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

/**
 * Login an existing user
 */
export async function loginService(
  credentials: LoginDto
): Promise<AuthResponseDto> {
  try {
    const endpoint = `${API_URL}auth/login`;
    console.log("Logging in at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log("Login response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login error response:", errorText);

      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }

      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`
      );
    }

    const data: AuthResponseDto = await response.json();
    console.log("Login successful");

    return data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

/**
 * Test connection to auth endpoint
 */
export async function testAuthConnection(): Promise<string> {
  try {
    const endpoint = `${API_URL}auth`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Connection test failed: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Auth connection test error:", error);
    throw error;
  }
}
