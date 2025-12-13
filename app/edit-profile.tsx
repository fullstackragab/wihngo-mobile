import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { mediaService } from "@/services/media.service";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
        "Name Required",
        "Please enter your name"
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
        "Profile Updated",
        "Your profile has been updated successfully"
      );

      // Navigate back
      router.back();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";

      addNotification("recommendation", "Error Updating Profile", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
                "Change Profile Photo",
                "Choose how you want to add a photo",
                [
                  {
                    text: "Take Photo",
                    onPress: () => takePhoto(),
                  },
                  {
                    text: "Choose from Library",
                    onPress: () => pickImage(),
                  },
                  {
                    text: "Cancel",
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
            <Text style={styles.changePictureText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="Your email"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
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
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#999",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
