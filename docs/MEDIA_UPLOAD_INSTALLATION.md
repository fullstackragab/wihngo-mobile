# Media Upload Installation Guide

## Required Packages

To complete the video and image upload implementation, install the following packages:

```bash
npx expo install expo-image-picker expo-av
```

## Package Details

### expo-image-picker

- **Purpose**: Provides access to device camera and photo/video library
- **Features**:
  - Pick videos and images from library
  - Capture videos and photos with camera
  - Built-in editing (cropping, aspect ratio)
  - Duration and quality settings for videos

### expo-av

- **Purpose**: Audio and video playback/recording
- **Features**:
  - Extract video metadata (duration, dimensions, size)
  - Video playback component
  - Audio recording and playback

## Permissions Required

Add the following permissions to your `app.json` or `app.config.ts`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos to upload bird images and videos.",
          "cameraPermission": "The app needs access to your camera to take photos and record videos of birds."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to your camera to take photos and record videos of birds.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to upload bird images and videos.",
        "NSMicrophoneUsageDescription": "This app needs access to your microphone to record audio with bird videos."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    }
  }
}
```

## Implementation Steps

### 1. Install Packages

```bash
npx expo install expo-image-picker expo-av
```

### 2. Update Permissions

Add the permissions configuration above to your app config.

### 3. Rebuild App

After adding permissions, rebuild your app:

```bash
# For development build
npx expo prebuild
npx expo run:ios
# or
npx expo run:android

# For EAS build
eas build --platform ios
eas build --platform android
```

### 4. Test Video Upload

1. Navigate to "Add Bird" screen
2. Tap on the video picker button
3. Try both "Record Video" and "Choose from Library"
4. Verify validation works for:
   - Video duration (5-60 seconds)
   - File size (max 50MB)
   - File format (.mp4, .mov, .m4v)

## Next Steps After Installation

Once packages are installed, the video picker hook (`hooks/useVideoPicker.ts`) contains commented example code that shows how to:

1. **Launch Image Library for Videos:**

```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: true,
  quality: finalOptions.quality,
  videoMaxDuration: finalOptions.maxDurationSeconds,
});
```

2. **Launch Camera for Video Recording:**

```typescript
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: true,
  quality: finalOptions.quality,
  videoMaxDuration: finalOptions.maxDurationSeconds,
});
```

3. **Extract Video Metadata:**

```typescript
import { Video } from "expo-av";

// Get video info
const { durationMillis } = await Video.getStatusAsync();
const duration = durationMillis / 1000; // Convert to seconds
```

## Troubleshooting

### Issue: "Image picker not working"

- Make sure you've installed the packages: `npx expo install expo-image-picker expo-av`
- Rebuild the app after installation
- Check permissions are correctly configured

### Issue: "Camera permission denied"

- iOS: Check Settings > [Your App] > Allow Camera Access
- Android: Check Settings > Apps > [Your App] > Permissions

### Issue: "Video too large"

- Videos over 50MB will be rejected by the frontend validation
- Consider recording shorter videos or lower quality
- Backend will handle compression after upload

## Backend Requirements

Don't forget to implement the backend endpoints:

- `POST /api/media/upload/video` - Upload and process videos
- `POST /api/media/upload/image` - Upload and process images

See `docs/MEDIA_UPLOAD_BACKEND_GUIDE.md` for complete backend implementation details.

## Testing Checklist

- [ ] Packages installed successfully
- [ ] Permissions configured in app.json
- [ ] App rebuilt with new permissions
- [ ] Video library picker works
- [ ] Camera recorder works
- [ ] Duration validation works (5-60 seconds)
- [ ] File size validation works (max 50MB)
- [ ] Format validation works (.mp4, .mov, .m4v)
- [ ] Error messages display correctly
- [ ] Video info shows after selection (duration, size)
- [ ] Form requires video before submission
- [ ] Backend upload endpoint working

## Support

For issues or questions:

- Frontend: Check `hooks/useVideoPicker.ts` and `components/ui/video-picker-button.tsx`
- Configuration: See `lib/constants/media.ts`
- Backend: Refer to `docs/MEDIA_UPLOAD_BACKEND_GUIDE.md`
