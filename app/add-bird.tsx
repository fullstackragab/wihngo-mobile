import ImagePickerButton from "@/components/ui/image-picker-button";
import ValidatedTextInput from "@/components/ui/validated-text-input";
import VideoPickerButton from "@/components/ui/video-picker-button";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useFormValidation } from "@/hooks/useFormValidation";
import { MEDIA_CONFIG } from "@/lib/constants/media";
import { birdService } from "@/services/bird.service";
import { CreateBirdDto } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddBird() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  const { validateForm, getFieldError, setFieldTouched, isFieldTouched } =
    useFormValidation({
      name: { required: true, message: "Bird name is required" },
      species: { required: true, message: "Species is required" },
      tagline: {
        required: true,
        maxLength: 100,
        message: "Tagline is required (max 100 characters)",
      },
      videoUrl: { required: true, message: "Bird video is required" },
    });

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      addNotification(
        "recommendation",
        "Authentication Required",
        "You must be logged in to add a bird"
      );
      router.push("/welcome");
      return;
    }

    // Validate form
    const isValid = validateForm({ name, species, tagline, videoUrl });
    if (!isValid) {
      return;
    }

    // Additional video validation
    if (!videoUrl.trim()) {
      return;
    }

    setLoading(true);
    try {
      const birdData: CreateBirdDto = {
        name: name.trim(),
        species: species.trim(),
        commonName: commonName.trim() || undefined,
        scientificName: scientificName.trim() || undefined,
        tagline: tagline.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        videoUrl: videoUrl.trim(),
        age: age.trim() || undefined,
        location: location.trim() || undefined,
      };

      // Create bird through API (automatically associates with authenticated user)
      const createdBird = await birdService.createBird(birdData);
      console.log("Bird created successfully:", createdBird);

      // Success - redirect back (no alert needed)
      router.back();
    } catch (error: any) {
      console.error("Error adding bird:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to add bird. Please try again.";

      if (error.message?.includes("Session expired")) {
        errorMessage = "Your session has expired. Please log in again.";
        router.push("/welcome");
      } else if (error.status === 400) {
        errorMessage = "Invalid bird information. Please check your input.";
      } else if (error.status === 401) {
        errorMessage = "You must be logged in to add a bird.";
        router.push("/welcome");
      } else if (error.message) {
        errorMessage = error.message;
      }

      addNotification("recommendation", "Error Adding Bird", errorMessage);
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
        <Text style={styles.headerTitle}>Add New Bird</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            loading ||
            !name.trim() ||
            !species.trim() ||
            !tagline.trim() ||
            !videoUrl.trim()
          }
        >
          <Text
            style={[
              styles.saveButton,
              (!name.trim() ||
                !species.trim() ||
                !tagline.trim() ||
                !videoUrl.trim() ||
                loading) &&
                styles.saveButtonDisabled,
            ]}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {/* Required Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <ValidatedTextInput
            label="Bird Name"
            value={name}
            onChangeText={setName}
            onBlur={() => setFieldTouched("name")}
            error={getFieldError("name")}
            touched={isFieldTouched("name")}
            required
            placeholder="e.g., Charlie"
          />

          <ValidatedTextInput
            label="Species"
            value={species}
            onChangeText={setSpecies}
            onBlur={() => setFieldTouched("species")}
            error={getFieldError("species")}
            touched={isFieldTouched("species")}
            required
            placeholder="e.g., Hummingbird"
          />

          <ValidatedTextInput
            label="Common Name"
            value={commonName}
            onChangeText={setCommonName}
            placeholder="e.g., Anna's Hummingbird"
          />

          <ValidatedTextInput
            label="Scientific Name"
            value={scientificName}
            onChangeText={setScientificName}
            placeholder="e.g., Calypte anna"
          />

          <ValidatedTextInput
            label="Tagline"
            value={tagline}
            onChangeText={setTagline}
            onBlur={() => setFieldTouched("tagline")}
            error={getFieldError("tagline")}
            touched={isFieldTouched("tagline")}
            required
            placeholder="A short, catchy description"
            maxLength={100}
          />
          <Text style={styles.charCount}>{tagline.length}/100</Text>

          <ValidatedTextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us more about this bird..."
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <ValidatedTextInput
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="e.g., 2 years"
          />

          <ValidatedTextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., California"
          />
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>

          <ImagePickerButton
            label="Profile Image"
            placeholder="Tap to select a profile image"
            initialUri={imageUrl}
            onImageSelected={setImageUrl}
            maxSizeMB={MEDIA_CONFIG.images.profile.maxSizeBytes / (1024 * 1024)}
          />

          <ImagePickerButton
            label="Cover Image"
            placeholder="Tap to select a cover image"
            initialUri={coverImageUrl}
            onImageSelected={setCoverImageUrl}
            maxSizeMB={MEDIA_CONFIG.images.cover.maxSizeBytes / (1024 * 1024)}
            aspectRatio={[16, 9]}
          />
        </View>

        {/* Video (Required) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video</Text>

          <VideoPickerButton
            label="Bird Video"
            placeholder="Tap to record or select a video"
            initialUri={videoUrl}
            onVideoSelected={setVideoUrl}
            required={true}
            showGuidelines={true}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for listing your bird</Text>
          <Text style={styles.tipsText}>
            • Record a short video (max 1 min) showing your bird's personality
          </Text>
          <Text style={styles.tipsText}>
            • Upload actual video files (.mp4, .mov) - no YouTube links
          </Text>
          <Text style={styles.tipsText}>• Use clear, high-quality photos</Text>
          <Text style={styles.tipsText}>
            • Write a compelling tagline that captures personality
          </Text>
          <Text style={styles.tipsText}>
            • Include details about care, behavior, and needs
          </Text>
          <Text style={styles.tipsText}>
            • Be honest and transparent with supporters
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  required: {
    color: "#E74C3C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "right",
    marginTop: 4,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: "#E8E8E8",
  },
  tipsSection: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
