import { NetworkError } from "@/contexts/network-context";
import { getAuthToken as getValidToken } from "@/lib/auth/auth-manager";
import { ensureNetworkConnectivity } from "@/lib/network-check";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

// Global handler for authentication errors
let authErrorHandler: (() => void) | null = null;

/**
 * Register a handler to be called when authentication errors occur (401)
 * This should be called by the AuthContext to handle logout
 */
export function setAuthErrorHandler(handler: () => void) {
  authErrorHandler = handler;
}

/**
 * Get the API base URL from configuration
 */
export const getApiBaseUrl = (): string => {
  let apiUrl =
    Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api/";

  // Replace localhost with 10.0.2.2 for Android emulator
  if (Platform.OS === "android" && apiUrl.includes("localhost")) {
    apiUrl = apiUrl.replace("localhost", "10.0.2.2");
  }

  return apiUrl;
};

/**
 * Convert relative URL to absolute URL
 */
const buildUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();

  // If endpoint already starts with http/https, return as is
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // Remove /api/ prefix from endpoint if present (since baseUrl already includes it)
  const finalEndpoint = cleanEndpoint.startsWith("api/")
    ? cleanEndpoint.slice(4)
    : cleanEndpoint;

  // Ensure baseUrl ends with /
  const finalBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `${finalBaseUrl}${finalEndpoint}`;
};

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Helper function to make authenticated API requests
 * Automatically includes the JWT token in the Authorization header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Check network connectivity before making request
    await ensureNetworkConnectivity();

    // Convert to absolute URL
    const absoluteUrl = buildUrl(url);
    console.log("🌐 API Request:", absoluteUrl);

    // Get token from storage with expiration check
    const token = await getValidToken();

    // Check if token exists before making request
    if (!token) {
      console.warn("⚠️ No valid authentication token found");
      // Call the auth error handler if registered
      if (authErrorHandler) {
        authErrorHandler();
      }
      throw new Error("Session expired. Please login again.");
    }

    // Merge headers with authorization
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "1", // Skip ngrok interstitial page
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    // Log headers being sent (without sensitive token)
    console.log("📤 Request Headers:", {
      ...headers,
      Authorization: "Bearer <token>",
    });

    // Make the request
    const response = await fetch(absoluteUrl, {
      ...options,
      headers,
    });

    // Log response details
    console.log("📥 Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      type: response.type,
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      // Call the auth error handler if registered (triggers logout in AuthContext)
      if (authErrorHandler) {
        authErrorHandler();
      }
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    console.error("Authenticated fetch error:", error);
    throw error;
  }
}

/**
 * GET request with authentication
 */
export async function authenticatedGet<T>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, { method: "GET" });

  if (!response.ok) {
    let errorData;
    const responseText = await response.text();
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = responseText;
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

/**
 * POST request with authentication
 */
export async function authenticatedPost<T>(url: string, data: any): Promise<T> {
  console.log("📤 POST Request Body:", JSON.stringify(data, null, 2));
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData;
    const responseText = await response.text();
    try {
      errorData = JSON.parse(responseText);
      console.log("❌ POST Error response data:", errorData);
    } catch {
      errorData = responseText;
      console.log("❌ POST Error response text:", errorData);
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses (201 Created with no body)
  if (response.status === 204 || response.status === 201) {
    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  return await response.json();
}

/**
 * PUT request with authentication
 */
export async function authenticatedPut<T>(url: string, data: any): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData;
    const responseText = await response.text();
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = responseText;
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

/**
 * DELETE request with authentication
 */
export async function authenticatedDelete<T>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, { method: "DELETE" });

  if (!response.ok) {
    let errorData;
    const responseText = await response.text();
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = responseText;
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses (204 No Content is common for DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * PATCH request with authentication
 */
export async function authenticatedPatch<T>(
  url: string,
  data: any
): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData;
    const responseText = await response.text();
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = responseText;
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

/**
 * Centralized API helper object used by all services
 * Provides consistent interface for all HTTP methods
 */
export const apiHelper = {
  get: authenticatedGet,
  post: authenticatedPost,
  put: authenticatedPut,
  patch: authenticatedPatch,
  delete: authenticatedDelete,
};

/**
 * Upload file/image with multipart form data
 */
export async function uploadFile<T>(
  url: string,
  file: File | Blob,
  fieldName: string = "file",
  additionalData?: Record<string, any>
): Promise<T> {
  try {
    // Check network connectivity before upload
    await ensureNetworkConnectivity();

    // Convert to absolute URL
    const absoluteUrl = buildUrl(url);
    console.log("🌐 Upload Request:", absoluteUrl);

    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const formData = new FormData();

    // Add the file
    formData.append(fieldName, file);

    // Add additional fields if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "1", // Skip ngrok interstitial page
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Log headers being sent for file upload
    console.log("📤 Upload Headers:", {
      ...headers,
      Authorization: token ? "Bearer <token>" : "(none)",
    });

    const response = await fetch(absoluteUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      const responseText = await response.text();
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = responseText;
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    return await response.json();
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Save auth token to storage
 */
export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get auth token from storage
 */
export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Remove auth token from storage
 */
export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * Clear all auth data from storage
 */
export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, "auth_user"]);
}
