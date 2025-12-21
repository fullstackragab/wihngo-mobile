/**
 * React Query hooks for Feed System
 *
 * Provides caching, background updates, and optimistic UI updates
 * for feed operations including ranked feed, sections, and preferences.
 */

import { cacheUtils, queryKeys, s3UrlCacheConfig } from '@/lib/query-client';
import { feedService } from '@/services/feed.service';
import { preferencesService } from '@/services/preferences.service';
import { birdService } from '@/services/bird.service';
import {
  FeedRequest,
  FeedResponse,
  FeedSection,
  FeedSectionType,
  RankedStory,
  UserPreferences,
} from '@/types/feed';
import { Bird } from '@/types/bird';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// ============================================================================
// Feed Hooks
// ============================================================================

/**
 * Hook to fetch personalized ranked feed with infinite scroll support
 *
 * @param pageSize - Items per page (default: 10)
 */
export function useFeed(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.ranked(),
    queryFn: ({ pageParam = 1 }) =>
      feedService.getRankedFeed({ page: pageParam, pageSize }),
    getNextPageParam: (lastPage: FeedResponse) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch all feed sections for the home screen
 *
 * @param storiesPerSection - Number of stories per section (default: 5)
 */
export function useFeedSections(storiesPerSection: number = 5) {
  return useQuery({
    queryKey: queryKeys.feed.allSections(storiesPerSection),
    queryFn: () => feedService.getAllSections(storiesPerSection),
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch a specific feed section
 *
 * @param sectionType - Section type
 * @param limit - Maximum stories to fetch (default: 10)
 * @param enabled - Whether to enable the query (default: true)
 */
export function useFeedSection(
  sectionType: FeedSectionType,
  limit: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.feed.sectionWithLimit(sectionType, limit),
    queryFn: () => feedService.getSection(sectionType, limit),
    enabled,
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch trending stories
 *
 * @param limit - Maximum stories to fetch (default: 10)
 */
export function useTrendingStories(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.feed.trendingWithLimit(limit),
    queryFn: () => feedService.getTrendingStories(limit),
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

// ============================================================================
// Preferences Hooks
// ============================================================================

/**
 * Hook to fetch user preferences
 */
export function useUserPreferences() {
  return useQuery({
    queryKey: queryKeys.user.preferences(),
    queryFn: () => preferencesService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update preferred languages
 */
export function useUpdatePreferredLanguages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (languages: string[]) =>
      preferencesService.updatePreferredLanguages(languages),
    onSuccess: () => {
      // Invalidate preferences and feed to reflect changes
      cacheUtils.invalidatePreferences();
      cacheUtils.invalidateFeed();
    },
    onMutate: async (languages) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.preferences(),
      });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        queryKeys.user.preferences()
      );

      // Optimistically update
      if (previousPreferences) {
        queryClient.setQueryData<UserPreferences>(
          queryKeys.user.preferences(),
          {
            ...previousPreferences,
            preferredLanguages: languages,
          }
        );
      }

      return { previousPreferences };
    },
    onError: (err, languages, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.user.preferences(),
          context.previousPreferences
        );
      }
    },
  });
}

/**
 * Hook to update country preference
 */
export function useUpdateCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (countryCode: string) =>
      preferencesService.updateCountry(countryCode),
    onSuccess: () => {
      // Invalidate preferences and feed to reflect changes
      cacheUtils.invalidatePreferences();
      cacheUtils.invalidateFeed();
    },
    onMutate: async (countryCode) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.preferences(),
      });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        queryKeys.user.preferences()
      );

      // Optimistically update
      if (previousPreferences) {
        queryClient.setQueryData<UserPreferences>(
          queryKeys.user.preferences(),
          {
            ...previousPreferences,
            country: countryCode,
          }
        );
      }

      return { previousPreferences };
    },
    onError: (err, countryCode, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.user.preferences(),
          context.previousPreferences
        );
      }
    },
  });
}

// ============================================================================
// Bird Follow Hooks
// ============================================================================

/**
 * Hook to check if following a specific bird
 *
 * @param birdId - Bird ID to check
 * @param enabled - Whether to enable the query (default: true)
 */
export function useIsFollowingBird(birdId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.birdFollows.isFollowing(birdId),
    queryFn: () => birdService.isFollowingBird(birdId),
    enabled: enabled && !!birdId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get all followed birds
 */
export function useFollowingBirds() {
  return useQuery({
    queryKey: queryKeys.birdFollows.following(),
    queryFn: () => birdService.getFollowingBirds(),
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to follow a bird with optimistic updates
 */
export function useFollowBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birdId: string) => birdService.followBird(birdId),
    onSuccess: (data, birdId) => {
      // Update the isFollowing cache for this bird
      queryClient.setQueryData(
        queryKeys.birdFollows.isFollowing(birdId),
        true
      );

      // Invalidate following list and feed sections
      cacheUtils.invalidateBirdFollows();
      cacheUtils.invalidateFeedSections();
    },
    onMutate: async (birdId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.birdFollows.isFollowing(birdId),
      });

      // Snapshot previous value
      const previousIsFollowing = queryClient.getQueryData<boolean>(
        queryKeys.birdFollows.isFollowing(birdId)
      );

      // Optimistically update to following
      queryClient.setQueryData(
        queryKeys.birdFollows.isFollowing(birdId),
        true
      );

      return { previousIsFollowing };
    },
    onError: (err, birdId, context) => {
      // Rollback on error
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(
          queryKeys.birdFollows.isFollowing(birdId),
          context.previousIsFollowing
        );
      }
    },
  });
}

/**
 * Hook to unfollow a bird with optimistic updates
 */
export function useUnfollowBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birdId: string) => birdService.unfollowBird(birdId),
    onSuccess: (data, birdId) => {
      // Update the isFollowing cache for this bird
      queryClient.setQueryData(
        queryKeys.birdFollows.isFollowing(birdId),
        false
      );

      // Invalidate following list and feed sections
      cacheUtils.invalidateBirdFollows();
      cacheUtils.invalidateFeedSections();
    },
    onMutate: async (birdId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.birdFollows.isFollowing(birdId),
      });

      // Snapshot previous value
      const previousIsFollowing = queryClient.getQueryData<boolean>(
        queryKeys.birdFollows.isFollowing(birdId)
      );

      // Optimistically update to not following
      queryClient.setQueryData(
        queryKeys.birdFollows.isFollowing(birdId),
        false
      );

      return { previousIsFollowing };
    },
    onError: (err, birdId, context) => {
      // Rollback on error
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(
          queryKeys.birdFollows.isFollowing(birdId),
          context.previousIsFollowing
        );
      }
    },
  });
}
