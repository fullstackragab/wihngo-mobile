/**
 * React Query hooks for Stories
 *
 * Provides caching, background updates, and optimistic UI updates
 * for all story-related operations
 */

import { cacheUtils, queryKeys, s3UrlCacheConfig } from "@/lib/query-client";
import { storyService } from "@/services/story.service";
import {
  CreateStoryDto,
  StoryDetailDto,
  StoryListResponse,
  UpdateStoryDto,
} from "@/types/story";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Hook to fetch paginated stories with infinite scroll support
 *
 * Features:
 * - Automatic pagination
 * - Cache management
 * - Background refetch
 * - Pull-to-refresh support
 *
 * @param pageSize - Items per page (default: 10)
 */
export function useStories(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.stories.lists(),
    queryFn: ({ pageParam = 1 }) =>
      storyService.getStories(pageParam, pageSize),
    getNextPageParam: (lastPage: StoryListResponse) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    // S3 URLs expire in 10 minutes
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch a single story detail
 *
 * @param storyId - Story ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useStoryDetail(storyId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.stories.detail(storyId),
    queryFn: () => storyService.getStoryDetail(storyId),
    enabled: enabled && !!storyId,
    // S3 URLs expire in 10 minutes
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch stories by user ID with infinite scroll
 *
 * @param userId - User ID
 * @param pageSize - Items per page (default: 10)
 * @param enabled - Whether to enable the query (default: true)
 */
export function useUserStories(
  userId: string,
  pageSize: number = 10,
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: queryKeys.stories.userStories(userId, 1, pageSize),
    queryFn: ({ pageParam = 1 }) =>
      storyService.getUserStories(userId, pageParam, pageSize),
    getNextPageParam: (lastPage: StoryListResponse) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!userId,
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch current user's stories with infinite scroll
 *
 * @param pageSize - Items per page (default: 10)
 */
export function useMyStories(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.stories.myStories(1, pageSize),
    queryFn: ({ pageParam = 1 }) =>
      storyService.getMyStories(pageParam, pageSize),
    getNextPageParam: (lastPage: StoryListResponse) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to create a new story with optimistic updates
 */
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoryDto) => storyService.createStory(data),
    onSuccess: (newStory) => {
      // Invalidate all story lists to refetch with new story
      cacheUtils.invalidateStories();

      // Optionally, add the new story to cache immediately
      queryClient.setQueryData(
        queryKeys.stories.detail(newStory.storyId),
        newStory
      );
    },
  });
}

/**
 * Hook to update a story with optimistic updates
 */
export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      data,
    }: {
      storyId: string;
      data: UpdateStoryDto;
    }) => storyService.updateStory(storyId, data),
    onMutate: async ({ storyId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.stories.detail(storyId),
      });

      // Snapshot previous value
      const previousStory = queryClient.getQueryData<StoryDetailDto>(
        queryKeys.stories.detail(storyId)
      );

      // Optimistically update the cache
      if (previousStory) {
        queryClient.setQueryData<StoryDetailDto>(
          queryKeys.stories.detail(storyId),
          {
            ...previousStory,
            ...data,
          }
        );
      }

      return { previousStory };
    },
    onError: (err, { storyId }, context) => {
      // Rollback on error
      if (context?.previousStory) {
        queryClient.setQueryData(
          queryKeys.stories.detail(storyId),
          context.previousStory
        );
      }
    },
    onSettled: (data, error, { storyId }) => {
      // Refetch to ensure consistency
      cacheUtils.invalidateStory(storyId);
      cacheUtils.invalidateStories(); // Invalidate lists too
    },
  });
}

/**
 * Hook to delete a story
 */
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => storyService.deleteStory(storyId),
    onSuccess: (_, storyId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.stories.detail(storyId),
      });

      // Invalidate all lists to remove deleted story
      cacheUtils.invalidateStories();
    },
  });
}
