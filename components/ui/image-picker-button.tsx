/**
 * ImagePickerButton Component
 * Reusable button for image selection with preview
 */

import { useImagePicker } from "@/hooks/useImagePicker";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
  initialUri?: string;
  label?: string;
  placeholder?: string;
  maxSizeMB?: number;
  style?: ViewStyle;
  aspectRatio?: [number, number];
  showPreview?: boolean;
}

export default function ImagePickerButton({
  onImageSelected,
  initialUri,
  label = "Select Image",
  placeholder = "Tap to select an image",
  maxSizeMB = 5,
  style,
  aspectRatio,
  showPreview = true,
}: ImagePickerButtonProps) {
  const { uri, loading, pickImage, takePhoto, clearImage } = useImagePicker(
    {
      maxSizeMB,
      aspect: aspectRatio,
      allowsEditing: true,
      quality: 0.8,
    },
    onImageSelected
  );

  const displayUri = uri || initialUri;

  const handlePress = () => {
    Alert.alert("Select Image", "Choose an option", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Library",
        onPress: pickImage,
      },
      ...(displayUri
        ? [
            {
              text: "Remove Image",
              style: "destructive" as const,
              onPress: () => {
                clearImage();
                onImageSelected("");
              },
            },
          ]
        : []),
      {
        text: "Cancel",
        style: "cancel" as const,
      },
    ]);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : displayUri && showPreview ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: displayUri }} style={styles.preview} />
            <View style={styles.overlay}>
              <Feather name="edit-2" size={24} color="#fff" />
              <Text style={styles.overlayText}>Change Image</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Feather name="image" size={48} color="#999" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {displayUri && !showPreview && (
        <View style={styles.selectedInfo}>
          <Feather name="check-circle" size={16} color="#10b981" />
          <Text style={styles.selectedText}>Image selected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  button: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 200,
    backgroundColor: "#f8f8f8",
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  overlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  selectedText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
});
