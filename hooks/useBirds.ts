/**
 * React Query hooks for Birds
 *
 * Provides caching, background updates, and optimistic UI updates
 * for all bird-related operations
 */

import { cacheUtils, queryKeys, s3UrlCacheConfig } from "@/lib/query-client";
import { birdService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Hook to fetch all birds as a simple list
 */
export function useBirds() {
  return useQuery({
    queryKey: [...queryKeys.birds.all, "simple"],
    queryFn: () => birdService.getBirds(),
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch all birds with infinite scroll support
 *
 * @param pageSize - Items per page (default: 20)
 */
export function useBirdsInfinite(pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.birds.all, "infinite", pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      // Note: If bird service doesn't have pagination, implement it or fetch all
      const birds = await birdService.getBirds();

      // Manual pagination for non-paginated API
      const start = (pageParam - 1) * pageSize;
      const end = start + pageSize;
      const paginatedBirds = birds.slice(start, end);

      return {
        items: paginatedBirds,
        page: pageParam,
        pageSize: pageSize,
        totalCount: birds.length,
      };
    },
    getNextPageParam: (lastPage) => {
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
 * Hook to fetch a single bird detail
 *
 * @param birdId - Bird ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useBirdDetail(birdId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.birds.detail(birdId),
    queryFn: () => birdService.getBirdById(birdId),
    enabled: enabled && !!birdId,
    // S3 URLs expire in 10 minutes
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to fetch user's owned birds
 *
 * @param userId - User ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useOwnedBirds(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.birds.ownedByUser(userId),
    queryFn: () => birdService.getOwnedBirds(userId),
    enabled: enabled && !!userId,
    staleTime: s3UrlCacheConfig.staleTime,
    gcTime: s3UrlCacheConfig.gcTime,
  });
}

/**
 * Hook to create a new bird
 */
export function useCreateBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => birdService.createBird(data),
    onSuccess: (newBird, variables) => {
      // Invalidate birds list
      cacheUtils.invalidateBirds();

      // Invalidate owned birds for the user
      if (variables.ownerId) {
        cacheUtils.invalidateOwnedBirds(variables.ownerId);
      }

      // Add to cache
      queryClient.setQueryData(queryKeys.birds.detail(newBird.birdId), newBird);
    },
  });
}

/**
 * Hook to update a bird
 */
export function useUpdateBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ birdId, data }: { birdId: string; data: any }) =>
      birdService.updateBird(birdId, data),
    onMutate: async ({ birdId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.birds.detail(birdId),
      });

      // Snapshot previous value
      const previousBird = queryClient.getQueryData<Bird>(
        queryKeys.birds.detail(birdId)
      );

      // Optimistically update
      if (previousBird) {
        queryClient.setQueryData<Bird>(queryKeys.birds.detail(birdId), {
          ...previousBird,
          ...data,
        });
      }

      return { previousBird };
    },
    onError: (err, { birdId }, context) => {
      // Rollback on error
      if (context?.previousBird) {
        queryClient.setQueryData(
          queryKeys.birds.detail(birdId),
          context.previousBird
        );
      }
    },
    onSettled: (data, error, { birdId }) => {
      // Refetch to ensure consistency
      cacheUtils.invalidateBird(birdId);
      cacheUtils.invalidateBirds();
    },
  });
}

/**
 * Hook to delete a bird
 */
export function useDeleteBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birdId: string) => birdService.deleteBird(birdId),
    onSuccess: (_, birdId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.birds.detail(birdId),
      });

      // Invalidate lists
      cacheUtils.invalidateBirds();
    },
  });
}

/**
 * Hook to love/support a bird
 */
export function useLoveBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birdId: string) => birdService.loveBird(birdId),
    onMutate: async (birdId) => {
      // Cancel queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.birds.detail(birdId),
      });

      const previousBird = queryClient.getQueryData<Bird>(
        queryKeys.birds.detail(birdId)
      );

      // Optimistically update love count
      if (previousBird) {
        queryClient.setQueryData<Bird>(queryKeys.birds.detail(birdId), {
          ...previousBird,
          lovedBy: (previousBird.lovedBy || 0) + 1,
        });
      }

      return { previousBird };
    },
    onError: (err, birdId, context) => {
      if (context?.previousBird) {
        queryClient.setQueryData(
          queryKeys.birds.detail(birdId),
          context.previousBird
        );
      }
    },
    onSettled: (data, error, birdId) => {
      cacheUtils.invalidateBird(birdId);
    },
  });
}

/**
 * Hook to support a bird (donation)
 */
export function useSupportBird() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birdId: string) => birdService.supportBird(birdId),
    onMutate: async (birdId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.birds.detail(birdId),
      });

      const previousBird = queryClient.getQueryData<Bird>(
        queryKeys.birds.detail(birdId)
      );

      // Optimistically update support count
      if (previousBird) {
        queryClient.setQueryData<Bird>(queryKeys.birds.detail(birdId), {
          ...previousBird,
          supportedBy: (previousBird.supportedBy || 0) + 1,
        });
      }

      return { previousBird };
    },
    onError: (err, birdId, context) => {
      if (context?.previousBird) {
        queryClient.setQueryData(
          queryKeys.birds.detail(birdId),
          context.previousBird
        );
      }
    },
    onSettled: (data, error, birdId) => {
      cacheUtils.invalidateBird(birdId);
    },
  });
}
