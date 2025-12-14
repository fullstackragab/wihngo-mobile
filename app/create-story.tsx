import { MoodBadge } from "@/components/MoodBadge";
import { MoodSelector } from "@/components/MoodSelector";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useVideoPicker } from "@/hooks/useVideoPicker";
import { mediaService } from "@/services/media.service";
import { storyService } from "@/services/story.service";
import { userService } from "@/services/user.service";
import { Bird } from "@/types/bird";
import { CreateStoryDto, StoryMode } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function CreateStory() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [selectedMood, setSelectedMood] = useState<StoryMode | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBirdModal, setShowBirdModal] = useState(false);
  const [userBirds, setUserBirds] = useState<Bird[]>([]);
  const [loadingBirds, setLoadingBirds] = useState(false);
  const { addNotification } = useNotifications();

  // Load user's birds on mount
  useEffect(() => {
    loadUserBirds();
  }, []);

  const loadUserBirds = async () => {
    if (!user) return;

    try {
      setLoadingBirds(true);
      const birds = await userService.getOwnedBirds(user.userId);
      setUserBirds(birds);
    } catch (error) {
      console.error("Error loading user birds:", error);
      addNotification("recommendation", "Error", "Failed to load your birds");
    } finally {
      setLoadingBirds(false);
    }
  };

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

  const handleAddPhoto = () => {
    // Clear video if it exists
    if (videoUri) {
      clearVideo();
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
    if (imageUri) {
      clearImage();
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!content.trim() || !selectedBird) {
      if (!selectedBird) {
        addNotification(
          "recommendation",
          "Bird Required",
          "Please select a bird to tag in your story."
        );
      } else if (!content.trim()) {
        addNotification(
          "recommendation",
          "Content Required",
          "Please write some content for your story."
        );
      }
      return;
    }

    // Validate content length (max 5000 chars)
    if (content.trim().length > 5000) {
      addNotification(
        "recommendation",
        "Content Too Long",
        "Story content must be less than 5000 characters."
      );
      return;
    }

    setLoading(true);
    try {
      // Step 1: Upload image to S3 if present (optional)
      // Note: Only ONE of image OR video should be uploaded, not both
      let imageS3Key: string | undefined;
      if (imageUri) {
        console.log("📤 Uploading story image...");
        imageS3Key = await mediaService.uploadFile(imageUri, "story");
        console.log("✅ Story image uploaded:", imageS3Key);
      }

      // Step 2: Upload video to S3 if present (optional)
      let videoS3Key: string | undefined;
      if (videoUri) {
        console.log("📤 Uploading story video...");
        videoS3Key = await mediaService.uploadFile(videoUri, "story");
        console.log("✅ Story video uploaded:", videoS3Key);
      }

      // Step 3: Create story with new API structure
      const storyData: CreateStoryDto = {
        content: content.trim(), // REQUIRED: Story content (max 5000 chars)
        birdIds: [selectedBird.birdId], // REQUIRED: Single bird
        mode: selectedMood || undefined, // OPTIONAL: Story mood
        imageS3Key: imageS3Key || undefined, // OPTIONAL: Image OR video, not both
        videoS3Key: videoS3Key || undefined, // OPTIONAL: Image OR video, not both
      };

      console.log("💾 Creating story with data:", storyData);
      const createdStory = await storyService.createStory(storyData);
      console.log("✅ Story created successfully:", createdStory.storyId);

      addNotification(
        "recommendation",
        "Story Created",
        "Your story has been shared successfully!"
      );

      // Success - redirect back
      router.back();
    } catch (error: any) {
      console.error("❌ Error creating story:", error);

      // Handle specific error cases from backend
      let errorMessage = "Failed to create story. Please try again.";
      if (error?.message?.includes("both")) {
        errorMessage = "Story can have either an image or a video, not both.";
      } else if (error?.message?.includes("bird")) {
        errorMessage = "Please select at least one bird.";
      } else if (error?.message?.includes("content")) {
        errorMessage = "Story content cannot be empty.";
      } else if (error?.message?.includes("S3")) {
        errorMessage = "Media upload failed. Please try again.";
      }

      addNotification("recommendation", "Error Creating Story", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !content.trim() || !selectedBird}
        >
          <Text
            style={[
              styles.postButton,
              (!content.trim() || !selectedBird || loading) &&
                styles.postButtonDisabled,
            ]}
          >
            {loading ? "Posting..." : "Post"}
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
          maxLength={5000}
        />
        <Text style={styles.characterCount}>{content.length}/5000</Text>

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
                <Text style={styles.selectedBirdName}>{selectedBird.name}</Text>
                <Text style={styles.selectedBirdSpecies}>
                  {selectedBird.species}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeBirdButton}
                onPress={handleOpenBirdSelector}
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

        {/* Mood Selection (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Mood <Text style={styles.optionalLabel}>(Optional)</Text>
          </Text>
          {selectedMood ? (
            <View style={styles.moodSelectedContainer}>
              <MoodBadge mode={selectedMood} size="medium" />
              <TouchableOpacity
                style={styles.changeMoodButton}
                onPress={() => setShowMoodSelector(true)}
              >
                <Text style={styles.changeMoodText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeMoodButton}
                onPress={() => setSelectedMood(null)}
              >
                <FontAwesome6 name="xmark" size={14} color="#95A5A6" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectMoodButton}
              onPress={() => setShowMoodSelector(true)}
            >
              <View style={styles.selectMoodContent}>
                <FontAwesome6 name="face-smile" size={20} color="#4ECDC4" />
                <Text style={styles.selectMoodText}>Choose a mood</Text>
              </View>
              <Text style={styles.selectMoodHint}>Optional</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Add Photo <Text style={styles.optionalLabel}>(Optional)</Text>
          </Text>
          {imageUri ? (
            <View>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={clearImage}
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
          <Text style={styles.sectionLabel}>
            Add Video <Text style={styles.optionalLabel}>(Optional)</Text>
          </Text>
          {videoUri ? (
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
                onPress={clearVideo}
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

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for great stories</Text>
          <Text style={styles.tipsText}>
            • Be authentic and share your experiences
          </Text>
          <Text style={styles.tipsText}>• Tag a bird (required)</Text>
          <Text style={styles.tipsText}>
            • Add a mood to help express your feelings (optional)
          </Text>
          <Text style={styles.tipsText}>
            • Add photos or videos to make it more engaging
          </Text>
          <Text style={styles.tipsText}>• Videos: Max 60 seconds, 200MB</Text>
        </View>
      </ScrollView>

      {/* Mood Selection Modal */}
      <MoodSelector
        visible={showMoodSelector}
        selectedMood={selectedMood}
        onSelect={(mood) => setSelectedMood(mood)}
        onClose={() => setShowMoodSelector(false)}
      />

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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.birdOption}
                  onPress={() => handleSelectBird(item)}
                >
                  <Image
                    source={{
                      uri: item.imageUrl || "https://via.placeholder.com/60",
                    }}
                    style={styles.birdOptionImage}
                  />
                  <View style={styles.birdOptionInfo}>
                    <Text style={styles.birdOptionName}>{item.name}</Text>
                    <Text style={styles.birdOptionSpecies}>
                      {item.species || "Unknown species"}
                    </Text>
                  </View>
                  {selectedBird?.birdId === item.birdId && (
                    <FontAwesome6 name="check" size={20} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <FontAwesome6 name="dove" size={48} color="#E8E8E8" />
                  <Text style={styles.emptyStateText}>No birds yet</Text>
                  <TouchableOpacity
                    style={styles.addBirdButton}
                    onPress={() => {
                      setShowBirdModal(false);
                      router.push("/add-bird");
                    }}
                  >
                    <Text style={styles.addBirdButtonText}>
                      Add Your First Bird
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  postButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  postButtonDisabled: {
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
  optionalLabel: {
    color: "#95A5A6",
    fontSize: 12,
    fontWeight: "400",
  },
  characterCount: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "right",
    marginTop: 8,
  },
  moodSelectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  changeMoodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E8F5F5",
  },
  changeMoodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  removeMoodButton: {
    padding: 6,
    marginLeft: "auto",
  },
  selectMoodButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
  },
  selectMoodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectMoodText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  selectMoodHint: {
    fontSize: 12,
    color: "#95A5A6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
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
    marginTop: 12,
    backgroundColor: "#E8E8E8",
  },
  removeImageButton: {
    position: "absolute",
    top: 20,
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
  addVideoText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  videoPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: "#F0F9F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginTop: 12,
  },
  videoPreviewSubtext: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 4,
  },
  removeVideoButton: {
    marginTop: 12,
    backgroundColor: "rgba(231, 76, 60, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
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
    borderRadius: 8,
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
    fontSize: 13,
    color: "#7F8C8D",
  },
  changeBirdButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E8F5F5",
  },
  changeBirdText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  selectedBird: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  birdThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
  },
  birdName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  tipsSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 4,
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
  selectedBirdsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  selectedBirdChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F5",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  birdChipThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
  },
  birdChipName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#95A5A6",
    marginTop: 16,
    marginBottom: 20,
  },
  addBirdButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBirdButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
