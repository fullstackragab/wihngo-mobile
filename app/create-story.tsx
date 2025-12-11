import { useNotifications } from "@/contexts/notification-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { Bird } from "@/types/bird";
import { CreateStoryDto } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleAddPhoto = () => {
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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedBird) {
      if (!selectedBird) {
        addNotification(
          "recommendation",
          "Bird Required",
          "Please select a bird to tag in your story."
        );
      }
      return;
    }

    setLoading(true);
    try {
      const storyData: CreateStoryDto = {
        title: title.trim(),
        content: content.trim(),
        birdId: selectedBird.birdId,
        imageUrl: imageUri || undefined,
      };

      // TODO: Replace with actual API call
      // await storyService.createStory(storyData);

      // Success - redirect back (no alert needed)
      router.back();
    } catch (error) {
      console.error("Error creating story:", error);
      addNotification(
        "recommendation",
        "Error Creating Story",
        "Failed to create story. Please try again."
      );
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
          disabled={
            loading || !title.trim() || !content.trim() || !selectedBird
          }
        >
          <Text
            style={[
              styles.postButton,
              (!title.trim() || !content.trim() || !selectedBird || loading) &&
                styles.postButtonDisabled,
            ]}
          >
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Story Title"
          placeholderTextColor="#95A5A6"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

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
          <Text style={styles.sectionLabel}>Add Photo (Optional)</Text>
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

        {/* Select Bird */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Tag a Bird <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectBirdButton}
            onPress={() => {
              // TODO: Open bird selector modal
            }}
          >
            {selectedBird ? (
              <View style={styles.selectedBird}>
                <Image
                  source={{
                    uri:
                      selectedBird.imageUrl || "https://via.placeholder.com/40",
                  }}
                  style={styles.birdThumb}
                />
                <Text style={styles.birdName}>{selectedBird.name}</Text>
                <TouchableOpacity onPress={() => setSelectedBird(null)}>
                  <FontAwesome6 name="xmark" size={16} color="#95A5A6" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectBirdContent}>
                <FontAwesome6 name="dove" size={20} color="#4ECDC4" />
                <Text style={styles.selectBirdText}>Select a bird</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for great stories</Text>
          <Text style={styles.tipsText}>
            • Be authentic and share your experiences
          </Text>
          <Text style={styles.tipsText}>
            • Add photos to make it more engaging
          </Text>
          <Text style={styles.tipsText}>
            • Tag the bird to help others discover them
          </Text>
        </View>
      </ScrollView>
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
});
