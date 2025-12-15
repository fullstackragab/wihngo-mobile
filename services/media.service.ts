import { apiHelper } from "./api-helper";

const MEDIA_ENDPOINT = "/api/media";

/**
 * Request for getting a pre-signed upload URL
 * Based on backend API: POST /api/media/upload-url
 */
export interface UploadUrlRequest {
  fileName: string; // Original file name (e.g., "my-story-image.jpg")
  contentType: string; // MIME type (e.g., "image/jpeg", "video/mp4")
  fileExtension: string; // File extension without dot (e.g., "png", "jpg", "mp4")
  mediaType:
    | "profile-image"
    | "bird-profile-image"
    | "bird-video"
    | "story-image"
    | "story-video"; // Specific media type
}

/**
 * Response from upload URL endpoint
 * Based on backend API: POST /api/media/upload-url
 */
export interface UploadUrlResponse {
  uploadUrl: string; // Pre-signed S3 URL for uploading
  s3Key: string; // S3 key to use when creating story
  expiresInMinutes: number; // URL expiration (10 minutes)
}

export interface DownloadUrlRequest {
  s3Key: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

export const mediaService = {
  /**
   * Step 1: Get pre-signed upload URL from API
   * @param fileName - Original file name (e.g., "photo.jpg")
   * @param contentType - MIME type (e.g., "image/jpeg")
   * @param fileExtension - File extension without dot (e.g., "png", "jpg", "mp4")
   * @param mediaType - Specific media type ("profile-image", "bird-profile-image", etc.)
   * @returns Upload URL, S3 key, and expiration info
   */
  async getUploadUrl(
    fileName: string,
    contentType: string,
    fileExtension: string,
    mediaType:
      | "profile-image"
      | "bird-profile-image"
      | "bird-video"
      | "story-image"
      | "story-video"
  ): Promise<UploadUrlResponse> {
    try {
      const request: UploadUrlRequest = {
        fileName,
        contentType,
        fileExtension,
        mediaType,
      };
      const response = await apiHelper.post<UploadUrlResponse>(
        `${MEDIA_ENDPOINT}/upload-url`,
        request
      );
      console.log(
        `✅ Got upload URL (expires in ${response.expiresInMinutes} minutes)`
      );
      return response;
    } catch (error) {
      console.error("❌ Error getting upload URL:", error);
      throw error;
    }
  },

  /**
   * Step 2: Upload file directly to S3 using pre-signed URL
   * IMPORTANT: Only sets Content-Type header to avoid signature mismatch
   */
  async uploadToS3(
    uploadUrl: string,
    fileUri: string,
    mimeType: string
  ): Promise<void> {
    try {
      console.log("📤 Preparing file for S3 upload...");

      // Fetch the file as a blob
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();

      console.log("📝 Content-Type:", mimeType);
      console.log("📦 Blob size:", fileBlob.size, "bytes");
      console.log("📤 Uploading to S3...");

      // Upload to S3 using PUT request
      // CRITICAL: Only set Content-Type header - no other headers!
      // Extra headers can cause signature mismatch and 403 errors
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
          // Don't add Authorization, x-amz-*, or any other headers
        },
        body: fileBlob,
      });

      console.log("📥 S3 Response Status:", s3Response.status);

      if (!s3Response.ok) {
        const errorText = await s3Response.text();
        console.error("❌ S3 upload failed:", {
          status: s3Response.status,
          statusText: s3Response.statusText,
          body: errorText,
        });
        throw new Error(
          `S3 upload failed: ${s3Response.status} - ${
            errorText || s3Response.statusText
          }`
        );
      }

      console.log("✅ File uploaded to S3 successfully");
    } catch (error) {
      console.error("❌ Error uploading to S3:", error);
      throw error;
    }
  },

  /**
   * Complete upload flow: Get upload URL and upload file
   * @param fileUri - Local file URI
   * @param mediaType - Specific media type ("profile-image", "bird-profile-image", "bird-video", "story-image", "story-video")
   * @returns S3 key to use in API calls
   */
  async uploadFile(
    fileUri: string,
    mediaType:
      | "profile-image"
      | "bird-profile-image"
      | "bird-video"
      | "story-image"
      | "story-video"
  ): Promise<string> {
    try {
      console.log("📤 Starting media upload flow...");

      // Extract file name and extension
      const fileName = fileUri.split("/").pop() || "file";
      const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";

      // Get Content-Type using helper function
      const contentType = getContentType(extension);

      console.log(`📝 File: ${fileName}`);
      console.log(`📝 Extension: ${extension}`);
      console.log(`📝 Content-Type: ${contentType}`);
      console.log(`📝 Media Type: ${mediaType}`);

      // Step 1: Get upload URL from backend
      console.log("📤 Step 1: Requesting upload URL...");
      const { uploadUrl, s3Key, expiresInMinutes } = await this.getUploadUrl(
        fileName,
        contentType,
        extension,
        mediaType
      );

      console.log(`🔑 S3 Key: ${s3Key}`);
      console.log(`⏰ Upload URL expires in: ${expiresInMinutes} minutes`);

      // Step 2: Upload to S3
      console.log("📤 Step 2: Uploading to S3...");
      await this.uploadToS3(uploadUrl, fileUri, contentType);

      console.log("✅ Upload complete! S3 Key:", s3Key);
      return s3Key;
    } catch (error) {
      console.error("❌ Error in upload flow:", error);
      throw error;
    }
  },

  /**
   * Get download URL for an S3 key
   */
  async getDownloadUrl(s3Key: string): Promise<DownloadUrlResponse> {
    try {
      const response = await apiHelper.post<DownloadUrlResponse>(
        `${MEDIA_ENDPOINT}/download-url`,
        { s3Key }
      );
      return response;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  },

  /**
   * Delete media file
   */
  async deleteMedia(s3Key: string): Promise<void> {
    try {
      await apiHelper.delete(
        `${MEDIA_ENDPOINT}?s3Key=${encodeURIComponent(s3Key)}`
      );
      console.log("✅ File deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  },

  /**
   * Check if media exists
   */
  async mediaExists(s3Key: string): Promise<boolean> {
    try {
      const response = await apiHelper.get<{ exists: boolean }>(
        `${MEDIA_ENDPOINT}/exists?s3Key=${encodeURIComponent(s3Key)}`
      );
      return response.exists;
    } catch (error) {
      console.error("Error checking media existence:", error);
      return false;
    }
  },
};
/**
 * Helper function to determine Content-Type from file extension
 */
function getContentType(extension: string): string {
  const ext = extension.toLowerCase().replace(".", "");

  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",
  };

  return contentTypes[ext] || "application/octet-stream";
}
