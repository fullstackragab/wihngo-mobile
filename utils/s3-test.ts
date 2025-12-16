/**
 * S3 Upload Test Utility
 *
 * Use this to test S3 uploads and debug 403 errors.
 *
 * Usage:
 * ```typescript
 * import { testS3Upload } from '@/utils/s3-test';
 *
 * // In your component
 * <Button title="Test S3 Upload" onPress={testS3Upload} />
 * ```
 */

import { mediaService } from "@/services/media.service";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Test S3 upload with detailed logging
 */
export async function testS3Upload(): Promise<void> {
  try {
    console.log("🧪 Starting S3 upload test...");

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library access to test uploads"
      );
      return;
    }

    // Pick a test image
    console.log("📸 Opening image picker...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      console.log("❌ User cancelled image picker");
      return;
    }

    const imageUri = result.assets[0].uri;
    console.log("✅ Image selected:", imageUri);

    // Test upload
    console.log("📤 Testing upload to S3...");
    const s3Key = await mediaService.uploadFile(imageUri, "profile-image");

    console.log("✅ Test passed! S3 Key:", s3Key);
    Alert.alert("✅ Success", `Upload successful!\n\nS3 Key:\n${s3Key}`, [
      { text: "OK" },
    ]);
  } catch (error) {
    console.error("❌ Test failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    Alert.alert(
      "❌ Test Failed",
      `Upload failed with error:\n\n${errorMessage}`,
      [{ text: "OK" }]
    );
  }
}

/**
 * Test multiple uploads in sequence
 */
export async function testMultipleUploads(count: number = 3): Promise<void> {
  try {
    console.log(`🧪 Starting multiple upload test (${count} uploads)...`);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library access to test uploads"
      );
      return;
    }

    const results: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      try {
        console.log(`\n📤 Upload ${i + 1}/${count}...`);

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });

        if (result.canceled) {
          console.log(`❌ Upload ${i + 1} cancelled by user`);
          break;
        }

        const imageUri = result.assets[0].uri;
        const s3Key = await mediaService.uploadFile(imageUri, "story-image");

        results.push(s3Key);
        console.log(`✅ Upload ${i + 1} successful:`, s3Key);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push(`Upload ${i + 1}: ${errorMessage}`);
        console.error(`❌ Upload ${i + 1} failed:`, error);
      }
    }

    // Show results
    const summary = `
Successful: ${results.length}
Failed: ${errors.length}

${
  errors.length > 0
    ? "Errors:\n" + errors.join("\n\n")
    : "All uploads successful! ✅"
}
    `.trim();

    Alert.alert("Test Complete", summary, [{ text: "OK" }]);
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    Alert.alert("Test Failed", String(error), [{ text: "OK" }]);
  }
}

/**
 * Validate S3 CORS configuration by attempting a simple upload
 */
export async function validateS3CORS(): Promise<boolean> {
  try {
    console.log("🔍 Validating S3 CORS configuration...");

    // This will request an upload URL and verify the backend is configured
    const response = await mediaService.getUploadUrl({
      mediaType: "profile-image",
      fileExtension: ".jpg",
    });

    console.log("✅ Backend S3 integration working");
    console.log("Upload URL:", response.uploadUrl);
    console.log("Instructions:", response.instructions);

    Alert.alert(
      "✅ Backend OK",
      `Backend S3 integration is working correctly.\n\nInstructions: ${response.instructions}`,
      [{ text: "OK" }]
    );

    return true;
  } catch (error) {
    console.error("❌ CORS validation failed:", error);
    Alert.alert(
      "❌ Configuration Error",
      `Failed to get upload URL from backend.\n\nError: ${
        error instanceof Error ? error.message : String(error)
      }\n\nMake sure:\n1. Backend is running\n2. AWS credentials are configured\n3. You are authenticated`,
      [{ text: "OK" }]
    );
    return false;
  }
}
