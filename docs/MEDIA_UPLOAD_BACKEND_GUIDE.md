# Media Upload Backend Implementation Guide

This guide outlines the backend requirements for handling media uploads (images and videos) with validation, compression, and optimization.

## Overview

The frontend now enforces strict media requirements to:

- Ensure consistent quality across the platform
- Minimize storage and bandwidth costs
- Provide optimal user experience on mobile devices
- Prevent abuse and ensure video files (not links) are uploaded

## Media Configuration Summary

### Videos (Required for Birds)

- **Max Duration**: 60 seconds (1 minute)
- **Min Duration**: 5 seconds
- **Max File Size**: 50MB (after compression)
- **Allowed Formats**: `.mp4`, `.mov`, `.m4v`
- **Target Resolution**: 720x1280 (720p vertical)
- **Target Bitrate**: 2 Mbps
- **FPS**: 30
- **Aspect Ratio**: 9:16 (vertical/portrait)

### Images

#### Profile/Bird Images

- **Max Size**: 2MB
- **Max Dimensions**: 1080x1080
- **Format**: JPEG, PNG, WebP
- **Aspect Ratio**: 1:1 (square)
- **Compression Quality**: 0.8

#### Cover Images

- **Max Size**: 3MB
- **Max Dimensions**: 1920x1080
- **Format**: JPEG, PNG, WebP
- **Aspect Ratio**: 16:9 (wide)
- **Compression Quality**: 0.85

#### Story Images

- **Max Size**: 2MB
- **Max Dimensions**: 1080x1350
- **Format**: JPEG, PNG, WebP
- **Aspect Ratio**: 4:5
- **Compression Quality**: 0.8

## Backend Requirements

### 1. API Endpoints

#### Upload Video

```
POST /api/media/upload/video
Content-Type: multipart/form-data

Body:
- video: File (required)
- type: 'bird' | 'story' (required)
- birdId?: string (optional, for updates)

Response:
{
  "success": true,
  "videoUrl": "https://storage.example.com/videos/abc123.mp4",
  "duration": 45.5,
  "size": 12345678,
  "width": 720,
  "height": 1280
}
```

#### Upload Image

```
POST /api/media/upload/image
Content-Type: multipart/form-data

Body:
- image: File (required)
- type: 'profile' | 'cover' | 'story' | 'thumbnail' (required)
- birdId?: string (optional)

Response:
{
  "success": true,
  "imageUrl": "https://storage.example.com/images/xyz789.jpg",
  "width": 1080,
  "height": 1080,
  "size": 987654
}
```

### 2. Validation Requirements

#### Video Validation

```csharp
public class VideoValidator
{
    private const int MAX_DURATION_SECONDS = 60;
    private const int MIN_DURATION_SECONDS = 5;
    private const int MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
    private readonly string[] ALLOWED_EXTENSIONS = { ".mp4", ".mov", ".m4v" };
    private readonly string[] ALLOWED_MIME_TYPES = {
        "video/mp4",
        "video/quicktime",
        "video/x-m4v"
    };

    public ValidationResult ValidateVideo(IFormFile file)
    {
        // 1. Check if file exists
        if (file == null || file.Length == 0)
            return ValidationResult.Error("Video file is required");

        // 2. Check file extension
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!ALLOWED_EXTENSIONS.Contains(extension))
            return ValidationResult.Error(
                $"Invalid file extension. Allowed: {string.Join(", ", ALLOWED_EXTENSIONS)}"
            );

        // 3. Check MIME type
        if (!ALLOWED_MIME_TYPES.Contains(file.ContentType.ToLower()))
            return ValidationResult.Error(
                $"Invalid MIME type. Must be a video file, not a link."
            );

        // 4. Check file size
        if (file.Length > MAX_FILE_SIZE_BYTES)
            return ValidationResult.Error(
                $"File size exceeds maximum of {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB"
            );

        // 5. Extract video metadata
        var metadata = ExtractVideoMetadata(file);

        // 6. Check duration
        if (metadata.Duration < MIN_DURATION_SECONDS)
            return ValidationResult.Error(
                $"Video too short. Minimum {MIN_DURATION_SECONDS} seconds"
            );

        if (metadata.Duration > MAX_DURATION_SECONDS)
            return ValidationResult.Error(
                $"Video too long. Maximum {MAX_DURATION_SECONDS} seconds"
            );

        // 7. Reject if appears to be a URL or link
        using var stream = file.OpenReadStream();
        var buffer = new byte[1024];
        stream.Read(buffer, 0, buffer.Length);
        var content = System.Text.Encoding.UTF8.GetString(buffer);

        if (content.Contains("http://") || content.Contains("https://") ||
            content.Contains("youtube") || content.Contains("youtu.be"))
        {
            return ValidationResult.Error(
                "Video links are not allowed. Please upload an actual video file."
            );
        }

        return ValidationResult.Success(metadata);
    }
}
```

#### Image Validation

```csharp
public class ImageValidator
{
    private readonly Dictionary<string, ImageConfig> _configs = new()
    {
        ["profile"] = new ImageConfig
        {
            MaxSize = 2 * 1024 * 1024,
            MaxWidth = 1080,
            MaxHeight = 1080
        },
        ["cover"] = new ImageConfig
        {
            MaxSize = 3 * 1024 * 1024,
            MaxWidth = 1920,
            MaxHeight = 1080
        },
        ["story"] = new ImageConfig
        {
            MaxSize = 2 * 1024 * 1024,
            MaxWidth = 1080,
            MaxHeight = 1350
        }
    };

    public ValidationResult ValidateImage(IFormFile file, string type)
    {
        if (!_configs.ContainsKey(type))
            return ValidationResult.Error("Invalid image type");

        var config = _configs[type];

        // Check file size
        if (file.Length > config.MaxSize)
            return ValidationResult.Error(
                $"Image too large. Maximum {config.MaxSize / (1024 * 1024)}MB"
            );

        // Check MIME type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return ValidationResult.Error("Invalid image format");

        // Check dimensions
        using var image = Image.Load(file.OpenReadStream());
        if (image.Width > config.MaxWidth || image.Height > config.MaxHeight)
            return ValidationResult.Error(
                $"Image dimensions too large. Maximum {config.MaxWidth}x{config.MaxHeight}"
            );

        return ValidationResult.Success();
    }
}
```

### 3. Video Processing Pipeline

The backend should process videos in the following order:

```csharp
public async Task<ProcessedVideo> ProcessVideo(IFormFile file, string type)
{
    // 1. Validate video
    var validation = _videoValidator.ValidateVideo(file);
    if (!validation.IsValid)
        throw new ValidationException(validation.Error);

    // 2. Generate unique filename
    var filename = GenerateUniqueFilename(file.FileName);

    // 3. Save original temporarily
    var tempPath = await SaveTemporaryFile(file, filename);

    try
    {
        // 4. Compress and optimize video
        var optimizedPath = await CompressVideo(tempPath, new VideoSettings
        {
            TargetWidth = 720,
            TargetHeight = 1280,
            TargetBitrate = 2000000, // 2 Mbps
            TargetFPS = 30,
            Quality = 0.75
        });

        // 5. Generate thumbnail
        var thumbnailPath = await GenerateThumbnail(optimizedPath);

        // 6. Upload to cloud storage
        var videoUrl = await _storageService.UploadVideo(optimizedPath);
        var thumbnailUrl = await _storageService.UploadImage(thumbnailPath);

        // 7. Get final metadata
        var metadata = ExtractVideoMetadata(optimizedPath);

        // 8. Clean up temporary files
        File.Delete(tempPath);
        File.Delete(optimizedPath);
        File.Delete(thumbnailPath);

        return new ProcessedVideo
        {
            VideoUrl = videoUrl,
            ThumbnailUrl = thumbnailUrl,
            Duration = metadata.Duration,
            Size = metadata.Size,
            Width = metadata.Width,
            Height = metadata.Height
        };
    }
    catch
    {
        // Clean up on error
        if (File.Exists(tempPath))
            File.Delete(tempPath);
        throw;
    }
}
```

### 4. Video Compression using FFmpeg

```csharp
public async Task<string> CompressVideo(string inputPath, VideoSettings settings)
{
    var outputPath = Path.ChangeExtension(inputPath, ".compressed.mp4");

    var arguments = new[]
    {
        "-i", inputPath,
        "-c:v", "libx264",                    // Video codec
        "-preset", "medium",                   // Encoding speed/quality balance
        "-crf", "23",                          // Constant Rate Factor (quality)
        "-vf", $"scale={settings.TargetWidth}:{settings.TargetHeight}:force_original_aspect_ratio=decrease,pad={settings.TargetWidth}:{settings.TargetHeight}:(ow-iw)/2:(oh-ih)/2",
        "-r", settings.TargetFPS.ToString(),   // Frame rate
        "-b:v", settings.TargetBitrate.ToString(), // Bitrate
        "-maxrate", settings.TargetBitrate.ToString(),
        "-bufsize", (settings.TargetBitrate * 2).ToString(),
        "-c:a", "aac",                         // Audio codec
        "-b:a", "128k",                        // Audio bitrate
        "-ar", "44100",                        // Audio sample rate
        "-movflags", "+faststart",             // Enable progressive download
        "-y",                                  // Overwrite output
        outputPath
    };

    var process = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = "ffmpeg",
            Arguments = string.Join(" ", arguments),
            UseShellExecute = false,
            RedirectStandardError = true,
            CreateNoWindow = true
        }
    };

    process.Start();
    await process.WaitForExitAsync();

    if (process.ExitCode != 0)
    {
        var error = await process.StandardError.ReadToEndAsync();
        throw new Exception($"FFmpeg compression failed: {error}");
    }

    return outputPath;
}
```

### 5. Database Schema Updates

Add `videoUrl` field to the Bird table:

```sql
ALTER TABLE Birds
ADD COLUMN videoUrl VARCHAR(500) NOT NULL,
ADD COLUMN videoThumbnailUrl VARCHAR(500),
ADD COLUMN videoDuration INT, -- in seconds
ADD COLUMN videoSize BIGINT; -- in bytes
```

### 6. Updated Bird API Endpoints

#### Create Bird (POST /api/birds)

```json
{
  "name": "Charlie",
  "species": "Hummingbird",
  "tagline": "A beautiful bird",
  "videoUrl": "https://storage.example.com/videos/abc123.mp4", // REQUIRED
  "imageUrl": "https://storage.example.com/images/profile.jpg", // optional
  "coverImageUrl": "https://storage.example.com/images/cover.jpg" // optional
}
```

#### Update Bird (PUT /api/birds/:id)

- Same as create, but all fields optional
- If `videoUrl` is changed, delete old video from storage

### 7. Storage Recommendations

1. **Use CDN**: Serve videos through a CDN (CloudFlare, AWS CloudFront)
2. **Cloud Storage**: AWS S3, Azure Blob Storage, or Google Cloud Storage
3. **Lifecycle Policies**: Auto-delete orphaned videos after 30 days
4. **Caching**: Cache video thumbnails aggressively
5. **Streaming**: Use HLS or DASH for adaptive streaming (future enhancement)

### 8. Cost Optimization

1. **Aggressive Compression**: 720p @ 2Mbps provides good quality at reasonable size
2. **Duration Limit**: 60 seconds max keeps storage costs down
3. **Cleanup**: Delete old videos when birds are deleted or videos replaced
4. **Lazy Loading**: Load videos only when user scrolls to them
5. **Thumbnail First**: Show thumbnail, load video on interaction

### 9. Security Considerations

1. **Virus Scanning**: Scan uploaded files for malware
2. **Rate Limiting**: Limit uploads per user per hour
3. **File Type Verification**: Check actual file content, not just extension
4. **URL Validation**: Reject any attempt to submit URLs instead of files
5. **Access Control**: Only bird owner can upload/update videos

## Testing Checklist

- [ ] Upload valid MP4 video (30 seconds)
- [ ] Reject video longer than 60 seconds
- [ ] Reject video shorter than 5 seconds
- [ ] Reject video larger than 50MB
- [ ] Reject invalid file formats (.txt, .pdf, etc.)
- [ ] Reject YouTube links or URLs
- [ ] Verify video compression works
- [ ] Verify thumbnail generation
- [ ] Test video playback in app
- [ ] Test image upload limits (2MB for profile)
- [ ] Test image dimension constraints
- [ ] Verify CDN delivery
- [ ] Test cleanup of old videos

## Implementation Priority

1. **Phase 1** (Critical):

   - Video upload endpoint
   - Basic validation (format, size, duration)
   - Storage integration

2. **Phase 2** (Important):

   - Video compression with FFmpeg
   - Thumbnail generation
   - Database schema updates

3. **Phase 3** (Enhancement):
   - CDN integration
   - Cleanup tasks
   - Advanced security

## Frontend Reference

The frontend implementation is in:

- `lib/constants/media.ts` - Media configuration
- `hooks/useVideoPicker.ts` - Video picker hook
- `components/ui/video-picker-button.tsx` - Video picker UI
- `app/add-bird.tsx` - Bird creation form

## Questions?

Contact the frontend team for any clarifications on the expected API contract or media requirements.
