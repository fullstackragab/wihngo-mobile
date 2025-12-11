/**
 * Media Configuration
 * Centralized configuration for images, videos, and other media files
 * Optimized for storage costs and consistent user experience
 */

export const MEDIA_CONFIG = {
  // Image Configuration
  images: {
    // Profile/Bird Images
    profile: {
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
      maxWidth: 1080,
      maxHeight: 1080,
      compressionQuality: 0.8,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      aspectRatio: [1, 1], // Square
    },
    // Cover Images
    cover: {
      maxSizeBytes: 3 * 1024 * 1024, // 3MB
      maxWidth: 1920,
      maxHeight: 1080,
      compressionQuality: 0.85,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      aspectRatio: [16, 9], // Wide format
    },
    // Story/Post Images
    story: {
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
      maxWidth: 1080,
      maxHeight: 1350,
      compressionQuality: 0.8,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      aspectRatio: [4, 5], // Instagram-style
    },
    // Thumbnail Images
    thumbnail: {
      maxSizeBytes: 500 * 1024, // 500KB
      maxWidth: 400,
      maxHeight: 400,
      compressionQuality: 0.75,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      aspectRatio: [1, 1],
    },
  },

  // Video Configuration
  videos: {
    // Bird Main Video (Required for each bird)
    birdMain: {
      maxSizeBytes: 200 * 1024 * 1024, // 200MB (before backend compression)
      maxDurationSeconds: 60, // 1 minute maximum
      minDurationSeconds: 5, // 5 seconds minimum
      targetWidth: 720, // 720p for cost optimization (backend compression)
      targetHeight: 1280, // Vertical format (9:16)
      targetBitrate: 2000000, // 2 Mbps - good quality, reasonable size
      compressionQuality: 0.75,
      allowedFormats: ["video/mp4", "video/quicktime", "video/x-m4v"],
      allowedExtensions: [".mp4", ".mov", ".m4v"],
      fps: 30,
      aspectRatio: [9, 16], // Vertical (mobile-first)
    },
    // Story Videos (Optional)
    story: {
      maxSizeBytes: 30 * 1024 * 1024, // 30MB
      maxDurationSeconds: 30, // 30 seconds
      minDurationSeconds: 3,
      targetWidth: 720,
      targetHeight: 1280,
      targetBitrate: 1500000, // 1.5 Mbps
      compressionQuality: 0.7,
      allowedFormats: ["video/mp4", "video/quicktime", "video/x-m4v"],
      allowedExtensions: [".mp4", ".mov", ".m4v"],
      fps: 30,
      aspectRatio: [9, 16],
    },
  },

  // General Media Limits
  general: {
    maxFileNameLength: 255,
    maxTotalMediaPerBird: 10, // Total images + videos
    allowedCharactersInFileName: /^[a-zA-Z0-9-_. ]+$/,
  },
} as const;

/**
 * Helper functions for media validation
 */

export const MediaValidation = {
  /**
   * Validate video file
   */
  isValidVideoFormat: (mimeType: string): boolean => {
    return MEDIA_CONFIG.videos.birdMain.allowedFormats.includes(
      mimeType as any
    );
  },

  /**
   * Validate video extension
   */
  isValidVideoExtension: (filename: string): boolean => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
    return MEDIA_CONFIG.videos.birdMain.allowedExtensions.includes(ext as any);
  },

  /**
   * Validate image format
   */
  isValidImageFormat: (
    mimeType: string,
    type: "profile" | "cover" | "story" | "thumbnail" = "profile"
  ): boolean => {
    return MEDIA_CONFIG.images[type].allowedFormats.includes(mimeType as any);
  },

  /**
   * Get human-readable file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Format duration in seconds to MM:SS
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * Check if file size is within limit
   */
  isValidFileSize: (sizeBytes: number, maxSizeBytes: number): boolean => {
    return sizeBytes > 0 && sizeBytes <= maxSizeBytes;
  },

  /**
   * Check if video duration is within limit
   */
  isValidVideoDuration: (
    durationSeconds: number,
    type: "birdMain" | "story" = "birdMain"
  ): boolean => {
    const config = MEDIA_CONFIG.videos[type];
    return (
      durationSeconds >= config.minDurationSeconds &&
      durationSeconds <= config.maxDurationSeconds
    );
  },
};

/**
 * Media upload guidelines for users
 */
export const MEDIA_GUIDELINES = {
  video: {
    title: "Video Requirements",
    rules: [
      "Upload an actual video file (.mp4, .mov, or .m4v)",
      "No YouTube links or external video URLs",
      `Maximum duration: ${MEDIA_CONFIG.videos.birdMain.maxDurationSeconds} seconds`,
      `Maximum size: ${MediaValidation.formatFileSize(
        MEDIA_CONFIG.videos.birdMain.maxSizeBytes
      )}`,
      "Videos will be automatically compressed and optimized",
      "Recommended: Record in vertical format (9:16) for best mobile viewing",
      "Good lighting and clear audio improve engagement",
    ],
  },
  image: {
    title: "Image Requirements",
    rules: [
      "Use high-quality, clear photos",
      `Profile images: Square format (1:1), max ${MediaValidation.formatFileSize(
        MEDIA_CONFIG.images.profile.maxSizeBytes
      )}`,
      `Cover images: Wide format (16:9), max ${MediaValidation.formatFileSize(
        MEDIA_CONFIG.images.cover.maxSizeBytes
      )}`,
      "Supported formats: JPEG, PNG, WebP",
      "Images will be automatically resized and compressed",
      "Avoid blurry or pixelated images",
    ],
  },
};

export default MEDIA_CONFIG;
