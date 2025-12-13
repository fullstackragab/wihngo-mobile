import { setAuthErrorHandler as setApiClientAuthErrorHandler } from "@/lib/api/api-client";
import { setAuthErrorHandler } from "@/services/api-helper";
import { AuthResponseDto, User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authData: AuthResponseDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  validateAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Centralized storage keys - must match across all files
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from storage on mount
  useEffect(() => {
    loadAuthData();
  }, []);

  // Register auth error handler
  useEffect(() => {
    const handleAuthError = () => {
      // This will be called when a 401 error occurs
      logout();
    };

    // Register for both API clients
    setAuthErrorHandler(handleAuthError);
    setApiClientAuthErrorHandler(handleAuthError);
  }, []);

  const loadAuthData = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authData: AuthResponseDto) => {
    try {
      console.log("🔐 Login: Saving auth data");

      const userData: User = {
        userId: authData.userId,
        name: authData.name,
        email: authData.email,
        profileImageUrl: authData.profileImageUrl,
        profileImageS3Key: authData.profileImageS3Key,
      };

      // Use expiresAt from API response, or calculate (1 hour from now as per API spec)
      const expiryTime = authData.expiresAt
        ? new Date(authData.expiresAt).getTime()
        : Date.now() + 60 * 60 * 1000; // 1 hour default

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authData.token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
        AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString()),
      ]);

      setToken(authData.token);
      setUser(userData);

      console.log("✅ Login: Auth data saved successfully");
      console.log("📧 Email confirmed:", authData.emailConfirmed);
    } catch (error) {
      console.error("❌ Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logout: Clearing auth data");

      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(TOKEN_EXPIRY_KEY),
      ]);

      setToken(null);
      setUser(null);

      console.log("✅ Logout: Auth data cleared");
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const validateAuth = async (): Promise<boolean> => {
    try {
      const [storedToken, expiryTimeStr] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
      ]);

      if (!storedToken) {
        console.log("⚠️ No token found");
        return false;
      }

      if (expiryTimeStr) {
        const expiryTime = parseInt(expiryTimeStr, 10);
        if (Date.now() > expiryTime) {
          console.log("⏰ Token expired, logging out");
          await logout();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("❌ Error validating auth:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
    validateAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
