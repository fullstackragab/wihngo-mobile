import { useVideoPlayer } from "expo-video";
import { useEffect } from "react";

interface VideoPreloaderProps {
  videoUrl: string;
}

/**
 * Preloads a video to make playback instant when needed
 * Component doesn't render anything, just manages video caching
 */
export function VideoPreloader({ videoUrl }: VideoPreloaderProps) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.muted = true;
    player.volume = 0;
    player.staysActiveInBackground = false;
  });

  useEffect(() => {
    if (player && videoUrl) {
      // Preload by loading the first frame
      player.currentTime = 0;
      player.pause();
    }

    return () => {
      // Cleanup
      if (player) {
        player.pause();
      }
    };
  }, [player, videoUrl]);

  return null; // This component doesn't render anything
}
