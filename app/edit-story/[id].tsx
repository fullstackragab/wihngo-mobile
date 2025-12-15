import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useVideoPicker } from "@/hooks/useVideoPicker";
import { mediaService } from "@/services/media.service";
import { storyService } from "@/services/story.service";
import { userService } from "@/services/user.service";
import { Bird } from "@/types/bird";
import { CreateStoryDto } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditStory() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBirdModal, setShowBirdModal] = useState(false);
  const [userBirds, setUserBirds] = useState<Bird[]>([]);
  const [loadingBirds, setLoadingBirds] = useState(false);
  const { addNotification } = useNotifications();

  const {
    uri: imageUri,
    pickImage,
    takePhoto,
    clearImage,
  } = useImagePicker({
    maxSizeMB: 5,
    quality: 0.8,
    allowsEditing: false,
  });

  const {
    uri: videoUri,
    pickVideo,
    recordVideo,
    clearVideo,
  } = useVideoPicker({
    maxDurationSeconds: 60,
    quality: 0.8,
  });

  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [initialVideoUrl, setInitialVideoUrl] = useState<string | null>(null);
  const [storyBirdIds, setStoryBirdIds] = useState<string[]>([]);

  const loadStoryData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const storyData = (await storyService.getStoryDetail(id)) as any;
      console.log("📖 Story data loaded:", storyData);

      // Set content
      setContent(storyData.content || "");

      if (storyData.imageUrl) {
        setInitialImageUrl(storyData.imageUrl);
      }
      if (storyData.videoUrl) {
        setInitialVideoUrl(storyData.videoUrl);
      }
      // Extract birdIds - for now just one bird from existing story
      let birdIdToUse = storyData.birdId;
      if (!birdIdToUse && storyData.bird?.birdId) {
        birdIdToUse = storyData.bird.birdId;
      }

      if (birdIdToUse) {
        console.log("🐦 Story birdId:", birdIdToUse);
        setStoryBirdIds([birdIdToUse]);
      }
    } catch (error) {
      console.error("Error loading story:", error);
      Alert.alert("Error", "Failed to load story data");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadUserBirds = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingBirds(true);
      const birds = await userService.getOwnedBirds(user.userId);
      setUserBirds(birds);
    } catch (error) {
      console.error("Error loading user birds:", error);
    } finally {
      setLoadingBirds(false);
    }
  }, [user]);

  // Load story data on mount
  useEffect(() => {
    if (id) {
      loadStoryData();
      loadUserBirds();
    }
  }, [id, loadStoryData, loadUserBirds]);

  // Set selected bird after birds are loaded
  useEffect(() => {
    if (userBirds.length > 0 && storyBirdIds.length > 0 && !selectedBird) {
      console.log("🔍 Looking for bird with ID:", storyBirdIds[0]);
      console.log(
        "📋 Available birds:",
        userBirds.map((b) => ({ id: b.birdId, name: b.name }))
      );
      const foundBird = userBirds.find((b) => storyBirdIds.includes(b.birdId));
      if (foundBird) {
        console.log("✅ Found and selected bird:", foundBird.name);
        setSelectedBird(foundBird);
      } else {
        console.warn("⚠️ Bird not found in user's birds");
      }
    }
  }, [userBirds, storyBirdIds, selectedBird]);

  const handleAddPhoto = () => {
    // Clear video if it exists
    if (videoUri || initialVideoUrl) {
      clearVideo();
      setInitialVideoUrl(null);
    }
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhoto,
        },
        {
          text: "Choose from Library",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddVideo = () => {
    // Clear image if it exists
    if (imageUri || initialImageUrl) {
      clearImage();
      setInitialImageUrl(null);
    }
    Alert.alert(
      "Add Video",
      "Choose an option",
      [
        {
          text: "Record Video",
          onPress: recordVideo,
        },
        {
          text: "Choose from Library",
          onPress: pickVideo,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSelectBird = (bird: Bird) => {
    setSelectedBird(bird);
    setShowBirdModal(false);
  };

  const handleOpenBirdSelector = () => {
    if (userBirds.length === 0) {
      Alert.alert(
        "No Birds Yet",
        "You don't have any birds yet. Would you like to add one?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Bird", onPress: () => router.push("/add-bird") },
        ]
      );
      return;
    }
    setShowBirdModal(true);
  };

  const handleSave = async () => {
    if (!content?.trim() || !selectedBird || !id) {
      if (!selectedBird) {
        addNotification(
          "recommendation",
          "Bird Required",
          "Please select a bird to tag in your story."
        );
      }
      return;
    }

    setSaving(true);
    try {
      // Step 1: Upload new image to S3 if changed (optional)
      let imageS3Key: string | undefined;
      if (imageUri && !imageUri.startsWith("http")) {
        // Only upload if it's a local file (not existing URL)
        console.log("📤 Uploading story image...");
        imageS3Key = await mediaService.uploadFile(imageUri, "story-image");
        console.log("✅ Story image uploaded:", imageS3Key);
      }

      // Step 2: Upload new video to S3 if changed (optional)
      let videoS3Key: string | undefined;
      if (videoUri && !videoUri.startsWith("http")) {
        // Only upload if it's a local file (not existing URL)
        console.log("📤 Uploading story video...");
        videoS3Key = await mediaService.uploadFile(videoUri, "story-video");
        console.log("✅ Story video uploaded:", videoS3Key);
      }

      // Step 3: Update story with data
      const storyData: CreateStoryDto = {
        content: content.trim(),
        birdIds: [selectedBird.birdId],
        imageS3Key,
        videoS3Key,
      };

      console.log("💾 Updating story with data:", storyData);
      await storyService.updateStory(id, storyData);
      console.log("✅ Story updated successfully");

      addNotification(
        "recommendation",
        "Story Updated",
        "Your story has been updated successfully!"
      );

      // Success - go back
      router.back();
    } catch (error) {
      console.error("Error updating story:", error);
      addNotification(
        "recommendation",
        "Error Updating Story",
        "Failed to update story. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Story</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !content.trim() || !selectedBird}
          >
            <Text
              style={[
                styles.saveButton,
                (!content.trim() || !selectedBird || saving) &&
                  styles.saveButtonDisabled,
              ]}
            >
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="Share your story..."
            placeholderTextColor="#95A5A6"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo (Optional)</Text>
            {imageUri || initialImageUrl ? (
              <View>
                <Image
                  source={{ uri: imageUri || initialImageUrl || "" }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    clearImage();
                    setInitialImageUrl(null);
                  }}
                >
                  <FontAwesome6 name="xmark" size={16} color="#fff" />
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddPhoto}
              >
                <FontAwesome6 name="camera" size={20} color="#4ECDC4" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Video Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Video (Optional)</Text>
            {videoUri || initialVideoUrl ? (
              <View>
                <View style={styles.videoPreview}>
                  <FontAwesome6 name="video" size={48} color="#4ECDC4" />
                  <Text style={styles.videoPreviewText}>Video Selected</Text>
                  <Text style={styles.videoPreviewSubtext}>
                    Max 60 seconds, 200MB
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={() => {
                    clearVideo();
                    setInitialVideoUrl(null);
                  }}
                >
                  <FontAwesome6 name="xmark" size={16} color="#fff" />
                  <Text style={styles.removeVideoText}>Remove Video</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addVideoButton}
                onPress={handleAddVideo}
              >
                <FontAwesome6 name="video" size={20} color="#4ECDC4" />
                <Text style={styles.addVideoText}>Add Video</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Select Bird */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Tag Bird <Text style={styles.requiredLabel}>*</Text>
            </Text>
            {selectedBird ? (
              <View style={styles.selectedBirdCard}>
                <Image
                  source={{
                    uri:
                      selectedBird.imageUrl || "https://via.placeholder.com/60",
                  }}
                  style={styles.selectedBirdImage}
                />
                <View style={styles.selectedBirdInfo}>
                  <Text style={styles.selectedBirdName}>
                    {selectedBird.name}
                  </Text>
                  <Text style={styles.selectedBirdSpecies}>
                    {selectedBird.species}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleOpenBirdSelector}
                  style={styles.changeBirdButton}
                >
                  <Text style={styles.changeBirdText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectBirdButton}
                onPress={handleOpenBirdSelector}
              >
                <View style={styles.selectBirdContent}>
                  <FontAwesome6 name="dove" size={20} color="#4ECDC4" />
                  <Text style={styles.selectBirdText}>Select a bird</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bird Selection Modal */}
        <Modal
          visible={showBirdModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBirdModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Bird</Text>
              <TouchableOpacity onPress={() => setShowBirdModal(false)}>
                <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            {loadingBirds ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#4ECDC4" />
              </View>
            ) : (
              <FlatList
                data={userBirds}
                keyExtractor={(item) => item.birdId}
                renderItem={({ item }) => {
                  const isSelected = selectedBird?.birdId === item.birdId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.birdOption,
                        isSelected && styles.birdOptionSelected,
                      ]}
                      onPress={() => handleSelectBird(item)}
                    >
                      <Image
                        source={{
                          uri:
                            item.imageUrl || "https://via.placeholder.com/60",
                        }}
                        style={styles.birdOptionImage}
                      />
                      <View style={styles.birdOptionInfo}>
                        <Text style={styles.birdOptionName}>{item.name}</Text>
                        <Text style={styles.birdOptionSpecies}>
                          {item.species || "Unknown species"}
                        </Text>
                      </View>
                      {isSelected && (
                        <FontAwesome6 name="check" size={20} color="#4ECDC4" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  saveButtonDisabled: {
    color: "#BDC3C7",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  requiredLabel: {
    color: "#E74C3C",
    fontSize: 14,
  },
  addPhotoButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8F9FA",
  },
  addPhotoText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  addVideoButton: {
    borderWidth: 2,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  addVideoText: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  videoPreview: {
    backgroundColor: "#F7F9FA",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  videoPreviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  videoPreviewSubtext: {
    fontSize: 12,
    color: "#95A5A6",
  },
  removeVideoButton: {
    marginTop: 8,
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  removeVideoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  selectBirdButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
  },
  selectBirdContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectBirdText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  selectedBirdCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  selectedBirdImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8E8E8",
  },
  selectedBirdInfo: {
    flex: 1,
  },
  selectedBirdName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  selectedBirdSpecies: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  changeBirdButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4ECDC4",
    borderRadius: 6,
  },
  changeBirdText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  birdOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  birdOptionSelected: {
    backgroundColor: "#E8F5F5",
  },
  birdOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8E8E8",
  },
  birdOptionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  birdOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  birdOptionSpecies: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 92,
  },
});
