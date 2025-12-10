/**
 * useImagePicker Hook
 * Reusable hook for image selection with validation and upload
 */

import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

export interface ImagePickerOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  quality?: number;
  aspect?: [number, number];
  allowsEditing?: boolean;
}

export interface ImagePickerResult {
  uri: string | null;
  loading: boolean;
  error: string | null;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  clearImage: () => void;
  uploadImage?: (uri: string) => Promise<string>;
}

const DEFAULT_OPTIONS: ImagePickerOptions = {
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  quality: 0.8,
  allowsEditing: true,
};

export function useImagePicker(
  options: ImagePickerOptions = {},
  onImageSelected?: (uri: string) => void
): ImagePickerResult {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [
      options.maxSizeMB,
      options.allowedTypes,
      options.quality,
      options.allowsEditing,
      options.aspect,
    ]
  );

  const pickImage = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your media library to select images."
        );
        setLoading(false);
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: finalOptions.allowsEditing,
        quality: finalOptions.quality,
        aspect: finalOptions.aspect,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];

        // Validate file size
        if (image.fileSize) {
          const maxSizeBytes = (finalOptions.maxSizeMB || 5) * 1024 * 1024;
          if (image.fileSize > maxSizeBytes) {
            Alert.alert(
              "File Too Large",
              `Image size exceeds ${
                finalOptions.maxSizeMB
              }MB limit.\n\nYour image: ${(
                image.fileSize /
                (1024 * 1024)
              ).toFixed(
                2
              )}MB\n\nTip: The image will be automatically compressed.`
            );
            // Continue anyway - we'll compress it
          }
        }

        setUri(image.uri);
        if (onImageSelected) {
          onImageSelected(image.uri);
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image");
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalOptions, onImageSelected]);

  const takePhoto = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Request camera permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera to take photos."
        );
        setLoading(false);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: finalOptions.allowsEditing,
        quality: finalOptions.quality,
        aspect: finalOptions.aspect,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];

        // Validate file size
        if (image.fileSize) {
          const maxSizeBytes = (finalOptions.maxSizeMB || 5) * 1024 * 1024;
          if (image.fileSize > maxSizeBytes) {
            Alert.alert(
              "File Too Large",
              `Image size exceeds ${
                finalOptions.maxSizeMB
              }MB limit.\n\nYour image: ${(
                image.fileSize /
                (1024 * 1024)
              ).toFixed(
                2
              )}MB\n\nTip: The image will be automatically compressed.`
            );
            // Continue anyway - we'll compress it
          }
        }

        setUri(image.uri);
        if (onImageSelected) {
          onImageSelected(image.uri);
        }
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      setError("Failed to take photo");
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalOptions, onImageSelected]);

  const clearImage = useCallback(() => {
    setUri(null);
    setError(null);
  }, []);

  return {
    uri,
    loading,
    error,
    pickImage,
    takePhoto,
    clearImage,
  };
}

/*
 * IMPLEMENTATION GUIDE FOR EXPO-IMAGE-PICKER
 *
 * 1. Install the package:
 *    npx expo install expo-image-picker
 *
 * 2. Replace the pickImage implementation with:
 *
 * const pickImage = useCallback(async () => {
 *   setError(null);
 *   setLoading(true);
 *
 *   try {
 *     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
 *     if (!permission.granted) {
 *       Alert.alert("Permission Required", "Please grant photo library access.");
 *       setLoading(false);
 *       return;
 *     }
 *
 *     const result = await ImagePicker.launchImageLibraryAsync({
 *       mediaTypes: ImagePicker.MediaTypeOptions.Images,
 *       allowsEditing: finalOptions.allowsEditing,
 *       aspect: finalOptions.aspect,
 *       quality: finalOptions.quality,
 *     });
 *
 *     if (!result.canceled) {
 *       const selectedUri = result.assets[0].uri;
 *       setUri(selectedUri);
 *       if (onImageSelected) {
 *         onImageSelected(selectedUri);
 *       }
 *     }
 *   } catch (err) {
 *     console.error("Error picking image:", err);
 *     setError("Failed to pick image");
 *     Alert.alert("Error", "Failed to select image.");
 *   } finally {
 *     setLoading(false);
 *   }
 * }, [finalOptions, onImageSelected]);
 *
 * 3. Replace the takePhoto implementation with similar logic using:
 *    ImagePicker.launchCameraAsync()
 */
