/**
 * VideoPickerButton Component
 * Reusable button for video selection with preview and validation
 */

import { useVideoPicker } from "@/hooks/useVideoPicker";
import { MEDIA_CONFIG, MediaValidation } from "@/lib/constants/media";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface VideoPickerButtonProps {
  onVideoSelected: (uri: string) => void;
  initialUri?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  style?: ViewStyle;
  showPreview?: boolean;
  showGuidelines?: boolean;
}

export default function VideoPickerButton({
  onVideoSelected,
  initialUri,
  label = "Bird Video",
  placeholder = "Tap to select or record a video",
  required = false,
  style,
  showPreview = true,
  showGuidelines = true,
}: VideoPickerButtonProps) {
  const { t } = useTranslation();
  const { uri, duration, size, loading, pickVideo, recordVideo, clearVideo } =
    useVideoPicker(
      {
        maxSizeBytes: MEDIA_CONFIG.videos.birdMain.maxSizeBytes,
        maxDurationSeconds: MEDIA_CONFIG.videos.birdMain.maxDurationSeconds,
        minDurationSeconds: MEDIA_CONFIG.videos.birdMain.minDurationSeconds,
      },
      onVideoSelected
    );

  const displayUri = uri || initialUri;

  const handlePress = () => {
    // Show options to record or select video
    Alert.alert(
      "Add Video",
      "Choose how you want to add a video",
      [
        {
          text: "Record Video",
          onPress: () => recordVideo(),
        },
        {
          text: "Select from Library",
          onPress: () => pickVideo(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const showVideoGuidelines = () => {
    // Guidelines are always visible in UI, no need for alert
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {showGuidelines && (
          <TouchableOpacity
            onPress={showVideoGuidelines}
            style={styles.infoButton}
          >
            <Feather name="info" size={18} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Video Picker Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t("media.processingVideo")}</Text>
          </View>
        ) : displayUri ? (
          <View style={styles.videoInfo}>
            <View style={styles.videoIconContainer}>
              <FontAwesome6 name="circle-play" size={64} color="#007AFF" />
            </View>
            <Text style={styles.videoSelectedText}>
              {t("media.videoSelected")}
            </Text>
            {duration && (
              <Text style={styles.videoMetaText}>
                Duration: {MediaValidation.formatDuration(duration)}
              </Text>
            )}
            {size && (
              <Text style={styles.videoMetaText}>
                Size: {MediaValidation.formatFileSize(size)}
              </Text>
            )}
            <View style={styles.changeButtonContainer}>
              <Feather name="edit-2" size={16} color="#007AFF" />
              <Text style={styles.changeText}>{t("media.tapToChange")}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <FontAwesome6 name="video" size={48} color="#999" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
            <Text style={styles.requirementsText}>
              Max{" "}
              {MediaValidation.formatDuration(
                MEDIA_CONFIG.videos.birdMain.maxDurationSeconds
              )}{" "}
              •{" "}
              {MediaValidation.formatFileSize(
                MEDIA_CONFIG.videos.birdMain.maxSizeBytes
              )}{" "}
              max
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Requirements Banner */}
      {required && !displayUri && (
        <View style={styles.requiredBanner}>
          <Feather name="alert-circle" size={14} color="#E74C3C" />
          <Text style={styles.requiredBannerText}>
            A video is required for each bird
          </Text>
        </View>
      )}

      {/* Quick Tips */}
      {showGuidelines && !displayUri && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsText}>
            💡 Upload an actual video file (.mp4, .mov) - not a YouTube link
          </Text>
          <Text style={styles.tipsText}>
            📱 Vertical format (9:16) recommended for mobile
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  required: {
    color: "#E74C3C",
    fontSize: 14,
  },
  infoButton: {
    padding: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  videoInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
    backgroundColor: "#E8F4FD",
  },
  videoIconContainer: {
    marginBottom: 8,
  },
  videoSelectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  videoMetaText: {
    fontSize: 12,
    color: "#666",
  },
  changeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 20,
  },
  changeText: {
    fontSize: 12,
    color: "#007AFF",
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
    fontWeight: "500",
  },
  requirementsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  requiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  requiredBannerText: {
    fontSize: 12,
    color: "#E74C3C",
    fontWeight: "500",
  },
  tipsContainer: {
    marginTop: 12,
    gap: 6,
  },
  tipsText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
});
