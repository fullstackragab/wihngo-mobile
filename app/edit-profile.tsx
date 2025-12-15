import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { mediaService } from "@/services/media.service";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

export default function EditProfile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);

  const {
    uri: profilePicture,
    loading: imageLoading,
    pickImage,
    takePhoto,
  } = useImagePicker(
    {
      maxSizeMB: 5,
      allowsEditing: false,
      quality: 0.8,
    },
    (uri) => {
      console.log("New profile picture selected:", uri);
    }
  );

  const handleSave = async () => {
    if (!name.trim()) {
      addNotification(
        "recommendation",
        t("profile.nameRequired"),
        t("profile.enterName")
      );
      return;
    }

    setLoading(true);
    try {
      let profileImageS3Key: string | undefined;

      // If user selected a new image, upload it to S3 first
      if (profilePicture) {
        console.log("📤 Uploading new profile image...");
        profileImageS3Key = await mediaService.uploadFile(
          profilePicture,
          "profile-image"
        );
        console.log("✅ Profile image uploaded:", profileImageS3Key);
      }

      // Update profile with new data
      console.log("💾 Updating profile...");
      const updatedProfile = await userService.updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        profileImageS3Key,
      });

      console.log("✅ Profile updated successfully:", updatedProfile);

      // Update user context with new profile data including S3 URL
      const updatedUser: User = {
        ...user,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        profileImageUrl: updatedProfile.profileImageUrl, // S3 pre-signed URL
        profileImageS3Key: updatedProfile.profileImageS3Key,
      };
      updateUser(updatedUser);
      console.log("✅ User context updated with new profile image URL");

      addNotification(
        "recommendation",
        t("profile.profileUpdated"),
        t("profile.profileUpdatedSuccess")
      );

      // Navigate back
      router.back();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("profile.updateFailed");

      addNotification(
        "recommendation",
        t("profile.errorUpdatingProfile"),
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.editProfile")}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !name.trim()}
        >
          <Text
            style={[
              styles.saveButton,
              (!name.trim() || loading) && styles.saveButtonDisabled,
            ]}
          >
            {loading ? t("profile.saving") : t("profile.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.profilePictureContainer}>
          {imageLoading ? (
            <View style={styles.profilePicturePlaceholder}>
              <ActivityIndicator size="large" color="#4ECDC4" />
            </View>
          ) : profilePicture || user?.profileImageUrl || user?.avatarUrl ? (
            <Image
              source={{
                uri: profilePicture || user?.profileImageUrl || user?.avatarUrl,
              }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <FontAwesome6 name="user" size={50} color="#999" />
            </View>
          )}
          <TouchableOpacity
            style={styles.changePictureButton}
            onPress={() => {
              Alert.alert(
                t("profile.changeProfilePhoto"),
                t("profile.choosePhotoMethod"),
                [
                  {
                    text: t("profile.takePhoto"),
                    onPress: () => takePhoto(),
                  },
                  {
                    text: t("profile.chooseFromLibrary"),
                    onPress: () => pickImage(),
                  },
                  {
                    text: t("common.cancel"),
                    style: "cancel",
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <FontAwesome6
              name="camera"
              size={16}
              color="#4ECDC4"
              style={styles.cameraIcon}
            />
            <Text style={styles.changePictureText}>
              {t("profile.changePhoto")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("profile.yourName")}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder={t("profile.yourEmail")}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.bioPlaceholder")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
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
    backgroundColor: "#fff",
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
  profilePictureContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  changePictureButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cameraIcon: {
    marginRight: 4,
  },
  changePictureText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  textArea: {
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
