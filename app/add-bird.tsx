import CityAutocomplete from "@/components/ui/city-autocomplete";
import ImagePickerButton from "@/components/ui/image-picker-button";
import SpeciesAutocomplete from "@/components/ui/species-autocomplete";
import ValidatedTextInput from "@/components/ui/validated-text-input";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useFormValidation } from "@/hooks/useFormValidation";
import { BirdSpecies } from "@/lib/constants/bird-species";
import { MEDIA_CONFIG } from "@/lib/constants/media";
import { cacheUtils } from "@/lib/query-client";
import { birdService } from "@/services/bird.service";
import { mediaService } from "@/services/media.service";
import { CreateBirdDto } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddBird() {
  const { t } = useTranslation();
  const router = useRouter();
  const { birdId } = useLocalSearchParams<{ birdId?: string }>();
  const isEditMode = !!birdId;
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [coverImageUri, setCoverImageUri] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const { addNotification } = useNotifications();

  // Load existing bird data in edit mode
  useEffect(() => {
    if (isEditMode && birdId) {
      loadBirdData();
    }
  }, [birdId]);

  const loadBirdData = async () => {
    try {
      setInitialLoading(true);
      const bird = await birdService.getBirdById(birdId!);

      // Populate form with existing data
      setName(bird.name || "");
      setSpecies(bird.species || "");
      setDescription(bird.description || "");
      setAge(bird.age || "");
      setLocation(bird.location || "");

      // For images, we'll use the URLs from the bird object
      // The user can change them by selecting new ones
      if (bird.imageUrl) setImageUri(bird.imageUrl);
      if (bird.coverImageUrl) setCoverImageUri(bird.coverImageUrl);
    } catch (error) {
      console.error("Error loading bird data:", error);
      addNotification("recommendation", "Error", "Failed to load bird data");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSpeciesSelected = (selectedSpecies: BirdSpecies) => {
    console.log("Species selected:", selectedSpecies);
    // Get translated species name
    const translationKey = `species.${selectedSpecies.species
      .toLowerCase()
      .replace(/['\s-]/g, "_")}`;
    const translatedName = t(translationKey);
    const displayName =
      translatedName !== translationKey
        ? translatedName
        : selectedSpecies.species;
    setSpecies(displayName);
  };

  const { validateForm, getFieldError, setFieldTouched, isFieldTouched } =
    useFormValidation({
      name: { required: true, message: "Bird name is required" },
      species: { required: true, message: "Species is required" },
      imageUri: { required: true, message: "Profile image is required" },
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
    const isValid = validateForm({
      name,
      species,
      imageUri,
    });
    if (!isValid) {
      return;
    }

    // Additional validation
    if (!imageUri.trim()) {
      addNotification(
        "recommendation",
        "Image Required",
        "Please select a profile image"
      );
      return;
    }

    setLoading(true);
    try {
      // Step 1: Upload profile image to S3 (required)
      console.log("📤 Uploading profile image...");
      const imageS3Key = await mediaService.uploadFile(
        imageUri,
        "bird-profile-image"
      );
      console.log("✅ Profile image uploaded:", imageS3Key);

      // Step 2: Upload cover image to S3 (optional)
      let coverImageS3Key: string | undefined;
      if (coverImageUri.trim()) {
        console.log("📤 Uploading cover image...");
        coverImageS3Key = await mediaService.uploadFile(
          coverImageUri,
          "bird-profile-image"
        );
        console.log("✅ Cover image uploaded:", coverImageS3Key);
      }

      // Step 3: Prepare bird data
      const birdData: CreateBirdDto = {
        name: name.trim(),
        species: species.trim(),
        description: description.trim() || undefined,
        imageS3Key,
        coverImageS3Key,
        age: age.trim() || undefined,
        location: location.trim() || undefined,
      };

      if (isEditMode && birdId) {
        console.log("💾 Updating bird with data:", birdData);
        await birdService.updateBird(birdId, birdData);
        console.log("Bird updated successfully");
      } else {
        console.log("💾 Creating bird with data:", birdData);
        const createdBird = await birdService.createBird(birdData);
        console.log("Bird created successfully:", createdBird);
      }

      // Invalidate birds cache to refresh the list
      cacheUtils.invalidateBirds();
      if (user?.userId) {
        cacheUtils.invalidateOwnedBirds(user.userId);
      }
      if (isEditMode && birdId) {
        cacheUtils.invalidateBird(birdId);
      }

      // Success - redirect back (no alert needed)
      router.back();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} bird:`, error);

      // Provide user-friendly error messages
      let errorMessage = `Failed to ${
        isEditMode ? "update" : "add"
      } bird. Please try again.`;

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

      addNotification(
        "recommendation",
        `Error ${isEditMode ? "Updating" : "Adding"} Bird`,
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("bird.loadingBirdData")}</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>
          {isEditMode ? t("bird.editBird") : t("bird.addBird")}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            loading || !name.trim() || !species.trim() || !imageUri.trim()
          }
        >
          <Text
            style={[
              styles.saveButton,
              (!name.trim() ||
                !species.trim() ||
                !imageUri.trim() ||
                loading) &&
                styles.saveButtonDisabled,
            ]}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Required Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("bird.sectionBasicInfo")}</Text>

          <ValidatedTextInput
            label={t("bird.birdName")}
            value={name}
            onChangeText={setName}
            onBlur={() => setFieldTouched("name")}
            error={getFieldError("name")}
            touched={isFieldTouched("name")}
            required
            placeholder={t("bird.namePlaceholder")}
          />

          <SpeciesAutocomplete
            label={t("bird.species")}
            value={species}
            onChangeText={setSpecies}
            onSpeciesSelected={handleSpeciesSelected}
            onBlur={() => setFieldTouched("species")}
            error={getFieldError("species")}
            touched={isFieldTouched("species")}
            required
            placeholder={t("bird.speciesPlaceholder")}
          />

          <ValidatedTextInput
            label={t("bird.description")}
            value={description}
            onChangeText={setDescription}
            placeholder={t("bird.descriptionPlaceholder")}
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("bird.sectionAdditionalDetails")}
          </Text>

          <ValidatedTextInput
            label={t("bird.age")}
            value={age}
            onChangeText={setAge}
            placeholder={t("bird.agePlaceholder")}
          />

          <CityAutocomplete
            value={location}
            onCitySelected={setLocation}
            placeholder={t("bird.locationPlaceholder")}
          />
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("bird.sectionImages")}</Text>

          <ImagePickerButton
            label={t("bird.profileImage")}
            placeholder={t("bird.profileImagePlaceholder")}
            initialUri={imageUri}
            onImageSelected={setImageUri}
            maxSizeMB={MEDIA_CONFIG.images.profile.maxSizeBytes / (1024 * 1024)}
            required
            error={getFieldError("imageUri")}
            touched={isFieldTouched("imageUri")}
            onBlur={() => setFieldTouched("imageUri")}
          />

          <ImagePickerButton
            label={t("bird.coverImage")}
            placeholder={t("bird.coverImagePlaceholder")}
            initialUri={coverImageUri}
            onImageSelected={setCoverImageUri}
            maxSizeMB={MEDIA_CONFIG.images.cover.maxSizeBytes / (1024 * 1024)}
            aspectRatio={[16, 9]}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>{t("bird.tipsTitle")}</Text>
          <Text style={styles.tipsText}>{t("bird.tipsClearPhotos")}</Text>
          <Text style={styles.tipsText}>{t("bird.tipsIncludeDetails")}</Text>
          <Text style={styles.tipsText}>{t("bird.tipsBeHonest")}</Text>
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
  scrollContent: {
    paddingBottom: 100,
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
  },
});
