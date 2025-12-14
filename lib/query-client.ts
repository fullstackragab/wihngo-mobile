/**
 * React Query (TanStack Query) Configuration
 *
 * Industry-standard caching solution for React Native/Expo apps
 * Features:
 * - Automatic background refetching
 * - Cache invalidation
 * - Optimistic updates
 * - Request deduplication
 * - Offline support
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Global QueryClient configuration
 *
 * Cache Times:
 * - staleTime: How long data is considered "fresh" (no refetch)
 * - gcTime: How long unused data stays in cache (formerly cacheTime)
 *
 * For pre-signed S3 URLs (10 min expiry):
 * - Set staleTime to 9 minutes (540000ms) to refetch before expiry
 * - Set gcTime to 10 minutes to clean up expired URLs
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Network mode
      networkMode: "offlineFirst", // Work offline with cached data

      // Retry configuration
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - default for most data
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch when app comes to foreground (mobile)
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      retry: 1, // Retry mutations once
      networkMode: "offlineFirst",
    },
  },
});

/**
 * Query Keys - Centralized key management
 * Prevents typos and makes invalidation easier
 */
export const queryKeys = {
  // Stories
  stories: {
    all: ["stories"] as const,
    lists: () => [...queryKeys.stories.all, "list"] as const,
    list: (page: number, pageSize: number) =>
      [...queryKeys.stories.lists(), { page, pageSize }] as const,
    details: () => [...queryKeys.stories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.stories.details(), id] as const,
    userStories: (userId: string, page: number, pageSize: number) =>
      [...queryKeys.stories.all, "user", userId, { page, pageSize }] as const,
    myStories: (page: number, pageSize: number) =>
      [...queryKeys.stories.all, "my", { page, pageSize }] as const,
  },

  // Birds
  birds: {
    all: ["birds"] as const,
    lists: () => [...queryKeys.birds.all, "list"] as const,
    list: (page: number, pageSize: number) =>
      [...queryKeys.birds.lists(), { page, pageSize }] as const,
    details: () => [...queryKeys.birds.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.birds.details(), id] as const,
    owned: () => [...queryKeys.birds.all, "owned"] as const,
    ownedByUser: (userId: string) =>
      [...queryKeys.birds.owned(), userId] as const,
  },

  // User
  user: {
    all: ["user"] as const,
    profile: (userId: string) =>
      [...queryKeys.user.all, "profile", userId] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
  },
};

/**
 * Cache invalidation helpers
 */
export const cacheUtils = {
  /**
   * Invalidate all stories cache
   */
  invalidateStories: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.stories.all,
    });
  },

  /**
   * Invalidate specific story
   */
  invalidateStory: (storyId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.stories.detail(storyId),
    });
  },

  /**
   * Invalidate all birds cache
   */
  invalidateBirds: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.birds.all,
    });
  },

  /**
   * Invalidate specific bird
   */
  invalidateBird: (birdId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.birds.detail(birdId),
    });
  },

  /**
   * Invalidate user's owned birds
   */
  invalidateOwnedBirds: (userId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.birds.ownedByUser(userId),
    });
  },

  /**
   * Clear all cache (use sparingly, e.g., on logout)
   */
  clearAll: () => {
    queryClient.clear();
  },
};

/**
 * Pre-signed URL cache configuration
 * S3 URLs expire in 10 minutes, so we need special handling
 */
export const s3UrlCacheConfig = {
  // Refetch at 9 minutes to avoid expiry
  staleTime: 9 * 60 * 1000, // 9 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchInterval: 9 * 60 * 1000, // Background refetch every 9 minutes
  refetchIntervalInBackground: false, // Don't refetch in background
};
