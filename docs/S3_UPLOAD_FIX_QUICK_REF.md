# S3 Upload Fix - Quick Reference

## ✅ Changes Applied

### 1. Updated media.service.ts

- ✅ Enhanced error logging to capture full S3 response details
- ✅ Added detailed console logs at each step of upload process
- ✅ Only sets Content-Type header (no extra headers that cause signature mismatch)
- ✅ Improved error messages with status codes and response body
- ✅ Added helper function `getContentType()` for proper MIME type mapping

### 2. Created s3-test.ts utility

- ✅ Test function to validate S3 uploads
- ✅ Multiple upload test for stress testing
- ✅ CORS validation function

## 🔧 How to Use

### Testing S3 Uploads

Add this to any screen for testing:

```typescript
import { testS3Upload } from "@/utils/s3-test";

// In your component
<TouchableOpacity onPress={testS3Upload}>
  <Text>Test S3 Upload</Text>
</TouchableOpacity>;
```

### Debugging Upload Failures

Check console logs for these key indicators:

```
📤 Starting S3 upload...           // Upload initiated
📤 Step 1: Getting upload URL...   // Requesting pre-signed URL
✅ Got upload URL                  // Backend responded
📤 Step 2: Uploading to S3...      // Starting S3 upload
📝 Content-Type: image/jpeg        // MIME type being used
📦 Blob size: 123456 bytes         // File size
📤 Uploading to S3...              // PUT request to S3
📥 S3 Response Status: 200         // S3 response status
✅ File uploaded to S3 successfully // Success!
```

### If You See 403 Error

Look for this in logs:

```
📥 S3 Response Status: 403
❌ S3 upload failed: {
  status: 403,
  statusText: 'Forbidden',
  body: '...' // S3 error details
}
```

Common causes:

1. **CORS not configured** - See AWS Console CORS setup below
2. **Extra headers** - Fixed in this update
3. **Expired pre-signed URL** - Backend should generate fresh URLs
4. **Wrong Content-Type** - Fixed with proper MIME type mapping

## 🌐 AWS S3 CORS Configuration

**CRITICAL:** You MUST configure CORS on S3 bucket!

### Steps:

1. Go to AWS S3 Console
2. Select bucket: `amzn-s3-wihngo-bucket`
3. Click "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

7. Click "Save changes"

**⚠️ Without CORS, ALL uploads will fail with 403!**

## 🔍 Validating the Fix

### Test 1: Check Backend

```typescript
import { validateS3CORS } from "@/utils/s3-test";

// This tests if backend can generate upload URLs
await validateS3CORS();
```

### Test 2: Upload Single File

```typescript
import { testS3Upload } from "@/utils/s3-test";

// This tests full upload flow
await testS3Upload();
```

### Test 3: Stress Test

```typescript
import { testMultipleUploads } from "@/utils/s3-test";

// Test 3 uploads in sequence
await testMultipleUploads(3);
```

## 📱 Current Upload Flow

```
1. User selects file
   ↓
2. App requests upload URL from backend
   POST /api/media/upload-url
   ← { uploadUrl, s3Key, instructions }
   ↓
3. App uploads file directly to S3
   PUT {uploadUrl}
   Headers: { Content-Type: image/jpeg }
   Body: file blob
   ↓
4. S3 responds with 200 OK (or 403 if CORS/permissions issue)
   ↓
5. App uses s3Key to update resource
   POST /api/birds { imageS3Key: s3Key }
   ↓
6. Backend verifies file exists in S3
   ↓
7. Resource created/updated successfully
```

## ⚠️ Important Notes

### What Changed in media.service.ts

**Before:**

```typescript
const response = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": mimeType,
  },
  body: fileBlob,
});

if (!response.ok) {
  throw new Error(`S3 upload failed: ${response.status}`);
}
```

**After:**

```typescript
const s3Response = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": mimeType,
    // CRITICAL: No other headers! They cause signature mismatch
  },
  body: fileBlob,
});

console.log("📥 S3 Response Status:", s3Response.status);

if (!s3Response.ok) {
  const errorText = await s3Response.text();
  console.error("❌ S3 upload failed:", {
    status: s3Response.status,
    statusText: s3Response.statusText,
    body: errorText, // Now captures full S3 error response
  });
  throw new Error(
    `S3 upload failed: ${s3Response.status} - ${
      errorText || s3Response.statusText
    }`
  );
}
```

### Key Improvements:

1. ✅ Better logging with emojis for easy scanning
2. ✅ Captures full error response from S3
3. ✅ Logs file size and Content-Type
4. ✅ Clear step-by-step progress indicators
5. ✅ Helpful comments about header restrictions

## 🚨 Troubleshooting

### Issue: Still getting 403 after CORS configuration

**Wait 2-3 minutes** for CORS changes to propagate, then:

1. Clear app cache
2. Restart Expo dev server
3. Try again

### Issue: Works sometimes, fails other times

**Check backend logs** for:

- AWS credentials expired
- S3 bucket policy changes
- Pre-signed URL expiration (should be 10 minutes)

### Issue: 403 with "SignatureDoesNotMatch"

**This means extra headers are being added**

- Fixed in this update by only setting Content-Type
- If still occurring, check if any middleware is adding headers

### Issue: Upload hangs or times out

**Check file size and connection**

- Large files (>10MB) may timeout on slow connections
- Videos especially can be large
- Consider implementing upload progress indicator

## 📊 Expected Logs (Success)

```
📤 Starting S3 upload...
📤 Step 1: Getting upload URL...
📝 Media type: profile-image
📝 File extension: .jpg
✅ Got upload URL
ℹ️ Instructions: Use PUT request to upload the file to the uploadUrl
🔑 S3 Key: users/profile-images/user-123/abc-123.jpg
📤 Step 2: Uploading to S3...
📤 Preparing file for S3 upload...
📝 Content-Type: image/jpeg
📦 Blob size: 245678 bytes
📤 Uploading to S3...
📥 S3 Response Status: 200
✅ File uploaded to S3 successfully
✅ Upload complete! S3 Key: users/profile-images/user-123/abc-123.jpg
```

## 📊 Expected Logs (Failure with Details)

```
📤 Starting S3 upload...
📤 Step 1: Getting upload URL...
✅ Got upload URL
📤 Step 2: Uploading to S3...
📤 Preparing file for S3 upload...
📝 Content-Type: image/jpeg
📦 Blob size: 245678 bytes
📤 Uploading to S3...
📥 S3 Response Status: 403
❌ S3 upload failed: {
  status: 403,
  statusText: 'Forbidden',
  body: '<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>AccessDenied</Code>
  <Message>CORS policy: No 'Access-Control-Allow-Origin' header</Message>
</Error>'
}
Error: S3 upload failed: 403 - CORS policy error
```

## ✅ Next Steps

1. **Configure CORS on S3** (if not done)
2. **Test upload** using `testS3Upload()`
3. **Verify in AWS Console** that files appear in bucket
4. **Test in real flows** (add bird, create story, update profile)
5. **Monitor logs** for any 403 errors

## 🔗 Related Files

- [media.service.ts](services/media.service.ts) - Updated upload logic
- [s3-test.ts](utils/s3-test.ts) - Test utilities
- [add-bird.tsx](app/add-bird.tsx) - Uses S3 upload for bird images
- [create-story.tsx](app/create-story.tsx) - Uses S3 upload for story images
- [edit-profile.tsx](app/edit-profile.tsx) - Uses S3 upload for profile images

---

**Last Updated:** December 13, 2025
**Status:** ✅ Ready for Testing
