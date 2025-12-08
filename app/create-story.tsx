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
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please fill in title and content");
      return;
    }

    setLoading(true);
    try {
      const storyData: CreateStoryDto = {
        title: title.trim(),
        content: content.trim(),
        birdId: selectedBird?.birdId,
        imageUrl: imageUrl.trim() || undefined,
      };

      // TODO: Replace with actual API call
      // await storyService.createStory(storyData);

      Alert.alert("Success", "Story created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating story:", error);
      Alert.alert("Error", "Failed to create story");
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
          disabled={loading || !title.trim() || !content.trim()}
        >
          <Text
            style={[
              styles.postButton,
              (!title.trim() || !content.trim() || loading) &&
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

        {/* Image URL Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add Photo (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter image URL"
            placeholderTextColor="#95A5A6"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />
          {imageUrl.trim() && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Select Bird */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tag a Bird (Optional)</Text>
          <TouchableOpacity
            style={styles.selectBirdButton}
            onPress={() => {
              // TODO: Open bird selector modal
              Alert.alert(
                "Coming Soon",
                "Bird selector will be available soon"
              );
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
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: "#E8E8E8",
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
