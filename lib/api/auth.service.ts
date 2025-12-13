import { API_CONFIG } from "@/lib/constants";
import { AuthResponseDto, LoginDto, UserCreateDto } from "@/types/user";
import { Platform } from "react-native";

/**
 * Authentication Service
 * Handles user registration, login, and authentication
 */

// Helper to replace localhost with appropriate IP for Android emulator
const getApiUrl = () => {
  let apiUrl = API_CONFIG.baseUrl;

  // Replace localhost with 10.0.2.2 for Android emulator
  if (Platform.OS === "android" && apiUrl.includes("localhost")) {
    apiUrl = apiUrl.replace("localhost", "10.0.2.2");
  }

  return apiUrl;
};

/**
 * Register a new user
 */
export async function register(
  userData: UserCreateDto
): Promise<AuthResponseDto> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/register`;
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
export async function login(credentials: LoginDto): Promise<AuthResponseDto> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/login`;
    console.log("🌐 API Base URL:", apiUrl);
    console.log("🔗 Login endpoint:", endpoint);
    console.log("📧 Login email:", credentials.email);

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
export async function testConnection(): Promise<string> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth`;
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

/**
 * Confirm email with token
 */
export async function confirmEmail(
  email: string,
  token: string
): Promise<{ message: string }> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/confirm-email`;
    console.log("Confirming email at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, token }),
    });

    console.log("Confirm email response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400) {
        if (errorData.code === "TOKEN_EXPIRED") {
          throw new Error(
            "Confirmation token has expired. Please request a new one."
          );
        } else if (errorData.code === "INVALID_TOKEN") {
          throw new Error("Invalid confirmation token.");
        } else if (errorData.code === "EMAIL_ALREADY_CONFIRMED") {
          throw new Error("Email is already confirmed.");
        }
      }

      throw new Error(
        errorData.message || `Email confirmation failed: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Email confirmed successfully");

    return data;
  } catch (error) {
    console.error("Error during email confirmation:", error);
    throw error;
  }
}

/**
 * Resend confirmation email
 */
export async function resendConfirmation(
  email: string
): Promise<{ message: string }> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/resend-confirmation`;
    console.log("Resending confirmation email at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    console.log("Resend confirmation response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to resend confirmation: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Confirmation email resent successfully");

    return data;
  } catch (error) {
    console.error("Error resending confirmation:", error);
    throw error;
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/forgot-password`;
    console.log("Requesting password reset at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    console.log("Forgot password response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Password reset request failed: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Password reset email sent successfully");

    return data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  try {
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}auth/reset-password`;
    console.log("Resetting password at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, token, newPassword }),
    });

    console.log("Reset password response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400) {
        if (errorData.code === "TOKEN_EXPIRED") {
          throw new Error("Reset token has expired. Please request a new one.");
        } else if (errorData.code === "INVALID_TOKEN") {
          throw new Error("Invalid reset token.");
        }
      }

      throw new Error(
        errorData.message || `Password reset failed: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Password reset successfully");

    return data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

/**
 * Auth service object for cleaner imports
 */
export const authService = {
  register,
  login,
  testConnection,
  confirmEmail,
  resendConfirmation,
  forgotPassword,
  resetPassword,
};

// Legacy exports for backward compatibility
export { login as loginService, register as registerService };
