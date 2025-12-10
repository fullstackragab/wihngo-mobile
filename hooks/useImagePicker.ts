/**
 * useImagePicker Hook
 * Reusable hook for image selection with validation and upload
 */

import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

// Note: Requires expo-image-picker to be installed
// Install with: npx expo install expo-image-picker
// Import ImagePicker when available

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
      // Placeholder for image picker logic
      // This will be implemented when expo-image-picker is installed
      Alert.alert(
        "Image Picker",
        "Image picker functionality requires expo-image-picker to be installed.\n\nRun: npx expo install expo-image-picker",
        [{ text: "OK" }]
      );

      // TODO: Implement with ImagePicker.launchImageLibraryAsync
      console.log("Image picker options:", finalOptions);
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image");
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalOptions]);

  const takePhoto = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Placeholder for camera logic
      Alert.alert(
        "Camera",
        "Camera functionality requires expo-image-picker to be installed.\n\nRun: npx expo install expo-image-picker",
        [{ text: "OK" }]
      );

      // TODO: Implement with ImagePicker.launchCameraAsync
      console.log("Camera options:", finalOptions);
    } catch (err) {
      console.error("Error taking photo:", err);
      setError("Failed to take photo");
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalOptions]);

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
