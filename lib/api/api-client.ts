import { NetworkError } from "@/contexts/network-context";
import i18n from "@/i18n";
import { getAuthToken } from "@/lib/auth/auth-manager";
import { STORAGE_KEYS } from "@/lib/constants";
import { ensureNetworkConnectivity } from "@/lib/network-check";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;

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

    // Get token from storage with expiration check
    const token = await getAuthToken();

    // Check if token exists before making request
    if (!token) {
      console.warn("⚠️ No valid authentication token found");
      // Call the auth error handler if registered
      if (authErrorHandler) {
        authErrorHandler();
      }
      throw new Error(i18n.t("auth.sessionExpired"));
    }

    // Set up headers with authorization
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      // Call the auth error handler if registered (triggers logout in AuthContext)
      if (authErrorHandler) {
        authErrorHandler();
      }
      throw new Error(i18n.t("auth.sessionExpired"));
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
  const response = await authenticatedFetch(url, {
    method: "POST",
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    return await response.json();
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

// Re-export auth utilities from centralized auth-manager
export {
  clearAuthData,
  getAuthToken,
  isAuthenticated,
  saveAuthToken,
} from "@/lib/auth/auth-manager";
