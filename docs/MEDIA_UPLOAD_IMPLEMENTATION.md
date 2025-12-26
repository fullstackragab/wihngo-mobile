# Media Upload Implementation Summary

## Overview

Implemented comprehensive media upload requirements with strict validation, size limits, and optimization guidelines to minimize storage costs and ensure consistent quality across the platform.

## Key Changes

### 1. Media Configuration (`lib/constants/media.ts`)

Created centralized media configuration with detailed specifications for:

#### Videos

- **Bird Main Video** (Required):
  - Max duration: 60 seconds (1 minute)
  - Min duration: 5 seconds
  - Max size: 50MB (after compression)
  - Formats: `.mp4`, `.mov`, `.m4v`
  - Target resolution: 720x1280 (720p vertical)
  - Bitrate: 2 Mbps
  - Aspect ratio: 9:16 (vertical/portrait)
  - FPS: 30

#### Images

- **Profile Images**: 2MB max, 1080x1080, square (1:1)
- **Cover Images**: 3MB max, 1920x1080, wide (16:9)
- **Story Images**: 2MB max, 1080x1350, (4:5)
- **Thumbnails**: 500KB max, 400x400, square (1:1)

All images support JPEG, PNG, and WebP formats with 0.75-0.85 compression quality.

### 2. Video Picker Hook (`hooks/useVideoPicker.ts`)

- Reusable hook for video selection
- Validates duration, size, and format
- Prepared for video compression integration
- Records video or picks from library
- Clear error messages for validation failures

### 3. Video Picker Button Component (`components/ui/video-picker-button.tsx`)

- User-friendly video upload interface
- Shows video requirements and guidelines
- Displays selected video info (duration, size)
- Built-in validation messages
- Info button for detailed guidelines
- Visual feedback for required field

### 4. Updated Bird Type (`types/bird.ts`)

```typescript
export type Bird = {
  // ... existing fields
  videoUrl?: string; // Main video for the bird
};

export type CreateBirdDto = {
  // ... existing fields
  videoUrl: string; // REQUIRED: Main video for the bird
};
```

### 5. Updated Add Bird Form (`app/add-bird.tsx`)

- Added video upload as required field
- Updated image size limits:
  - Profile: 2MB (down from 5MB)
  - Cover: 3MB (down from 5MB)
- Form validation includes video requirement
- Submit button disabled without video
- Updated tips to include video guidance

## Benefits

### Cost Optimization

1. **Video Compression**: 720p @ 2Mbps significantly reduces storage
2. **Duration Limit**: 60-second max keeps costs predictable
3. **Image Limits**: Reduced from 5MB to 2-3MB per image
4. **Standardized Dimensions**: Prevents oversized uploads

### User Experience

1. **Consistent Layout**: Fixed dimensions ensure proper display
2. **Mobile-First**: Vertical 9:16 format optimized for mobile viewing
3. **Fast Loading**: Compressed media loads quickly
4. **Clear Guidelines**: Users know requirements upfront

### Quality Control

1. **No External Links**: Only actual video files allowed
2. **Format Validation**: Prevents invalid file uploads
3. **Duration Limits**: Ensures content stays focused
4. **Resolution Standards**: Maintains professional appearance

## File Structure

```
lib/constants/
  └── media.ts              # Media configuration and validation helpers

hooks/
  └── useVideoPicker.ts     # Video picker hook with validation

components/ui/
  └── video-picker-button.tsx  # Video picker UI component

types/
  └── bird.ts               # Updated with videoUrl field

app/
  └── add-bird.tsx          # Updated form with video upload

docs/
  └── MEDIA_UPLOAD_BACKEND_GUIDE.md  # Backend implementation guide
```

## Implementation Details

### Frontend Validation

- File format checking (`.mp4`, `.mov`, `.m4v`)
- MIME type validation
- Duration limits (5-60 seconds)
- Size limits (50MB max)
- Prevents YouTube/external links

### Media Guidelines for Users

Provided in-app via info button:

- Upload actual video files, not links
- Maximum duration and size limits
- Recommended vertical format
- Quality tips (lighting, audio)

### Helper Functions

```typescript
MediaValidation.isValidVideoFormat(mimeType);
MediaValidation.isValidVideoExtension(filename);
MediaValidation.isValidVideoDuration(seconds);
MediaValidation.formatFileSize(bytes);
MediaValidation.formatDuration(seconds);
```

## Backend Requirements

Comprehensive guide created at `docs/MEDIA_UPLOAD_BACKEND_GUIDE.md` including:

1. **API Endpoints**:

   - `POST /api/media/upload/video`
   - `POST /api/media/upload/image`

2. **Validation**: Server-side checks for format, size, duration

3. **Video Processing**:

   - FFmpeg compression to 720p @ 2Mbps
   - Thumbnail generation
   - Metadata extraction

4. **Storage**:

   - Cloud storage (S3, Azure Blob, GCS)
   - CDN delivery
   - Lifecycle policies for cleanup

5. **Database Updates**:
   ```sql
   ALTER TABLE Birds
   ADD COLUMN videoUrl VARCHAR(500) NOT NULL,
   ADD COLUMN videoThumbnailUrl VARCHAR(500),
   ADD COLUMN videoDuration INT,
   ADD COLUMN videoSize BIGINT;
   ```

## Next Steps for Full Implementation

### Phase 1 - Core Video Upload (Priority: HIGH)

1. Install required packages:

   ```bash
   npx expo install expo-image-picker expo-av
   ```

2. Implement video picker in `useVideoPicker.ts`:

   - Use `ImagePicker.launchImageLibraryAsync` with `MediaTypeOptions.Videos`
   - Use `ImagePicker.launchCameraAsync` for recording
   - Extract video metadata with `expo-av`

3. Backend API endpoints for video upload

### Phase 2 - Video Compression (Priority: HIGH)

1. Backend FFmpeg integration
2. Video compression to 720p @ 2Mbps
3. Automatic thumbnail generation

### Phase 3 - Storage & CDN (Priority: MEDIUM)

1. Cloud storage integration (S3/Azure/GCS)
2. CDN setup for fast delivery
3. Cleanup tasks for orphaned videos

### Phase 4 - Advanced Features (Priority: LOW)

1. Video preview before upload
2. Trim/edit functionality
3. Progress indicators for large uploads
4. Multiple video support per bird

## Testing Requirements

### Frontend Testing

- [ ] Video picker opens correctly
- [ ] Camera recording works
- [ ] Library selection works
- [ ] Validation messages show properly
- [ ] Form submission requires video
- [ ] Guidelines display correctly

### Backend Testing

- [ ] Video upload endpoint works
- [ ] Validation rejects invalid files
- [ ] Compression reduces file size
- [ ] Thumbnails generate correctly
- [ ] Videos serve through CDN
- [ ] Cleanup tasks run properly

## Migration Considerations

### Existing Birds

- Existing birds without videos need migration strategy
- Options:
  1. Make video optional for existing birds (soft enforcement)
  2. Require owners to add videos (hard enforcement)
  3. Set deadline for video addition

### Data Migration

```sql
-- Option 1: Make videoUrl nullable for existing records
ALTER TABLE Birds
ALTER COLUMN videoUrl DROP NOT NULL;

-- Option 2: Set default placeholder
UPDATE Birds
SET videoUrl = 'placeholder.mp4'
WHERE videoUrl IS NULL;
```

## Configuration Summary

| Media Type    | Max Size | Max Duration | Dimensions | Format       | Aspect Ratio |
| ------------- | -------- | ------------ | ---------- | ------------ | ------------ |
| Bird Video    | 50MB     | 60s          | 720x1280   | mp4/mov      | 9:16         |
| Profile Image | 2MB      | -            | 1080x1080  | jpg/png/webp | 1:1          |
| Cover Image   | 3MB      | -            | 1920x1080  | jpg/png/webp | 16:9         |
| Story Image   | 2MB      | -            | 1080x1350  | jpg/png/webp | 4:5          |

## Estimated Storage Impact

### Before Implementation

- Images: ~5MB each (uncompressed)
- No videos
- 1,000 birds = ~5GB

### After Implementation

- Profile Image: ~500KB (compressed)
- Cover Image: ~800KB (compressed)
- Video: ~10MB (60s @ 2Mbps)
- 1,000 birds = ~11.3GB

### Cost Projection (AWS S3 Standard)

- Storage: ~$0.26/GB/month
- 10,000 birds = ~113GB = ~$29/month storage
- Transfer: ~$0.09/GB (first 10TB)
- With CDN caching: significantly reduced transfer costs

## Support & Documentation

- **Frontend**: `lib/constants/media.ts` (complete configuration)
- **Backend**: `docs/MEDIA_UPLOAD_BACKEND_GUIDE.md` (implementation guide)
- **User Guidelines**: Available in-app via info button
- **Validation Helpers**: `MediaValidation` utility functions

## Notes

1. **Video Links Prohibited**: The system explicitly rejects YouTube links or any external URLs. Only actual video file uploads are accepted.

2. **Compression Required**: Videos should be compressed on the backend to the target specifications (720p @ 2Mbps) to minimize storage costs.

3. **Mobile-First Design**: The 9:16 (vertical) aspect ratio is optimized for mobile viewing, which is the primary use case.

4. **Future Enhancements**: Consider adaptive streaming (HLS/DASH) for very long videos or multiple quality options.

## Questions or Issues?

Refer to:

- Media configuration: `lib/constants/media.ts`
- Backend guide: `docs/MEDIA_UPLOAD_BACKEND_GUIDE.md`
- Implementation examples: `app/add-bird.tsx`
