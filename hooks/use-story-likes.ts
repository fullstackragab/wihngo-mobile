/**
 * useStoryLikes Hook
 * Custom hook for managing story like state with automatic status checking
 */

import { useAuth } from "@/contexts/auth-context";
import { likeService } from "@/services/like.service";
import { useEffect, useState } from "react";

interface UseStoryLikesOptions {
  storyId: string;
  initialLikeCount?: number;
}

interface UseStoryLikesReturn {
  isLiked: boolean;
  likeCount: number;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

/**
 * Hook to manage story like state
 * Automatically checks like status on mount if user is authenticated
 */
export function useStoryLikes({
  storyId,
  initialLikeCount = 0,
}: UseStoryLikesOptions): UseStoryLikesReturn {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Check like status on mount
  useEffect(() => {
    if (user && storyId) {
      checkLikeStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, user]);

  const checkLikeStatus = async () => {
    try {
      const status = await likeService.checkStoryLikeStatus(storyId);
      setIsLiked(status.isLiked);
    } catch (error) {
      console.log("Could not check like status:", error);
      setIsLiked(false);
    }
  };

  const toggleLike = async () => {
    if (isLoading) return;

    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? Math.max(0, likeCount - 1) : likeCount + 1);

    try {
      setIsLoading(true);
      await likeService.toggleStoryLike(storyId, isLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (user) {
      await checkLikeStatus();
    }
  };

  return {
    isLiked,
    likeCount,
    isLoading,
    toggleLike,
    refreshStatus,
  };
}
