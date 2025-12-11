/**
 * useVideoPicker Hook
 * Reusable hook for video selection with validation, compression, and upload
 */

import { MEDIA_CONFIG, MediaValidation } from "@/lib/constants/media";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface VideoPickerOptions {
  maxSizeBytes?: number;
  maxDurationSeconds?: number;
  minDurationSeconds?: number;
  allowedFormats?: readonly string[];
  quality?: number;
  targetWidth?: number;
  targetHeight?: number;
}

export interface VideoPickerResult {
  uri: string | null;
  duration: number | null;
  size: number | null;
  loading: boolean;
  error: string | null;
  pickVideo: () => Promise<void>;
  recordVideo: () => Promise<void>;
  clearVideo: () => void;
  uploadVideo?: (uri: string) => Promise<string>;
}

const DEFAULT_OPTIONS: VideoPickerOptions = {
  maxSizeBytes: MEDIA_CONFIG.videos.birdMain.maxSizeBytes,
  maxDurationSeconds: MEDIA_CONFIG.videos.birdMain.maxDurationSeconds,
  minDurationSeconds: MEDIA_CONFIG.videos.birdMain.minDurationSeconds,
  allowedFormats: MEDIA_CONFIG.videos.birdMain.allowedFormats,
  quality: MEDIA_CONFIG.videos.birdMain.compressionQuality,
  targetWidth: MEDIA_CONFIG.videos.birdMain.targetWidth,
  targetHeight: MEDIA_CONFIG.videos.birdMain.targetHeight,
};

export function useVideoPicker(
  options: VideoPickerOptions = {},
  onVideoSelected?: (uri: string) => void
): VideoPickerResult {
  const [uri, setUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalOptions = React.useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.maxSizeBytes,
      options.maxDurationSeconds,
      options.minDurationSeconds,
      options.quality,
      options.targetWidth,
      options.targetHeight,
    ]
  );

  const validateVideo = useCallback(
    async (
      videoUri: string,
      videoDuration?: number,
      videoSize?: number
    ): Promise<boolean> => {
      // Validate duration
      if (videoDuration) {
        if (!MediaValidation.isValidVideoDuration(videoDuration, "birdMain")) {
          const maxDuration = MediaValidation.formatDuration(
            finalOptions.maxDurationSeconds || 60
          );
          const minDuration = MediaValidation.formatDuration(
            finalOptions.minDurationSeconds || 5
          );
          Alert.alert(
            "Invalid Duration",
            `Video must be between ${minDuration} and ${maxDuration}.\n\nYour video: ${MediaValidation.formatDuration(
              videoDuration
            )}`
          );
          return false;
        }
      }

      // Validate size
      if (videoSize) {
        if (
          !MediaValidation.isValidFileSize(
            videoSize,
            finalOptions.maxSizeBytes ||
              MEDIA_CONFIG.videos.birdMain.maxSizeBytes
          )
        ) {
          Alert.alert(
            "File Too Large",
            `Video size exceeds maximum allowed size of ${MediaValidation.formatFileSize(
              finalOptions.maxSizeBytes ||
                MEDIA_CONFIG.videos.birdMain.maxSizeBytes
            )}.\n\nYour video: ${MediaValidation.formatFileSize(
              videoSize
            )}\n\nTip: Try recording a shorter video or use a lower quality setting.`
          );
          return false;
        }
      }

      return true;
    },
    [finalOptions]
  );

  const pickVideo = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your media library to select videos."
        );
        setLoading(false);
        return;
      }

      // Launch image library with video option
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: finalOptions.quality,
        videoMaxDuration: finalOptions.maxDurationSeconds,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];

        // Convert duration from milliseconds to seconds
        const durationInSeconds = video.duration
          ? video.duration / 1000
          : undefined;

        // Validate and process video
        const isValid = await validateVideo(
          video.uri,
          durationInSeconds,
          video.fileSize ?? undefined
        );

        if (isValid) {
          setUri(video.uri);
          setDuration(durationInSeconds || null);
          setSize(video.fileSize || null);

          if (onVideoSelected) {
            onVideoSelected(video.uri);
          }
        }
      }
    } catch (err) {
      console.error("Error picking video:", err);
      setError("Failed to pick video");
      Alert.alert("Error", "Failed to select video. Please try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateVideo, onVideoSelected]);

  const recordVideo = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Request camera permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera to record videos."
        );
        setLoading(false);
        return;
      }

      // Launch camera for video recording
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false, // Disable editing to prevent camera issues
        quality: finalOptions.quality,
        videoMaxDuration: finalOptions.maxDurationSeconds,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];

        // Convert duration from milliseconds to seconds
        const durationInSeconds = video.duration
          ? video.duration / 1000
          : undefined;

        const isValid = await validateVideo(
          video.uri,
          durationInSeconds,
          video.fileSize ?? undefined
        );

        if (isValid) {
          setUri(video.uri);
          setDuration(durationInSeconds || null);
          setSize(video.fileSize || null);

          if (onVideoSelected) {
            onVideoSelected(video.uri);
          }
        }
      }
    } catch (err) {
      console.error("Error recording video:", err);
      setError("Failed to record video");
      Alert.alert("Error", "Failed to record video. Please try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateVideo, onVideoSelected]);

  const clearVideo = useCallback(() => {
    setUri(null);
    setDuration(null);
    setSize(null);
    setError(null);
  }, []);

  return {
    uri,
    duration,
    size,
    loading,
    error,
    pickVideo,
    recordVideo,
    clearVideo,
  };
}

// Note: Video compression and processing will be handled by the backend
// The frontend accepts videos up to 200MB, and the backend will:
// 1. Compress video to target bitrate (2 Mbps)
// 2. Resize to 720p resolution (720x1280 for vertical)
// 3. Optimize for mobile streaming
// 4. Generate thumbnails
// 5. Return the processed video URL
