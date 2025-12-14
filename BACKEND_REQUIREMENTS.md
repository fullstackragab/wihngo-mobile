# Backend Requirements for Mobile App

## Story API Requirements

### 1. Get Stories (Paginated)

**Endpoint:** `GET /api/stories?page={page}&pageSize={pageSize}`

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `pageSize` (integer, default: 10) - Number of items per page

**Expected Response:**

```json
{
  "items": [
    {
      "storyId": "string",
      "content": "string",
      "imageUrl": "string (optional)",
      "videoUrl": "string (optional)",
      "mode": "string (optional) - one of: LoveAndBond, NewBeginning, ProgressAndWins, FunnyMoment, PeacefulMoment, LossAndMemory, CareAndHealth, DailyLife",
      "birdIds": ["string"], // Array of bird IDs (at least 1 required)
      "userName": "string",
      "userId": "string",
      "userAvatar": "string (optional)",
      "likes": "number",
      "commentsCount": "number",
      "isLiked": "boolean",
      "createdAt": "ISO 8601 datetime string",
      "title": "string (optional) - for backward compatibility"
    }
  ],
  "totalCount": "number",
  "page": "number",
  "pageSize": "number",
  "hasMore": "boolean"
}
```

**Notes:**

- Should return stories in reverse chronological order (newest first)
- `imageUrl` and `videoUrl` should be pre-signed S3 URLs with appropriate expiration
- Only ONE of `imageUrl` OR `videoUrl` should be present (not both)
- If `videoUrl` is present, `imageUrl` can serve as video thumbnail
- Page numbering starts at 1

---

### 2. Get Story Detail

**Endpoint:** `GET /api/stories/{storyId}`

**Expected Response:**

```json
{
  "storyId": "string",
  "content": "string",
  "imageUrl": "string (optional)",
  "videoUrl": "string (optional)",
  "mode": "string (optional)",
  "birds": [
    {
      "birdId": "string",
      "name": "string",
      "species": "string",
      "imageUrl": "string (optional)"
    }
  ],
  "author": {
    "userId": "string",
    "name": "string",
    "avatar": "string (optional)"
  },
  "likes": "number",
  "commentsCount": "number",
  "isLiked": "boolean",
  "createdAt": "ISO 8601 datetime string",
  "comments": [
    {
      "commentId": "string",
      "content": "string",
      "userName": "string",
      "userId": "string",
      "userAvatar": "string (optional)",
      "createdAt": "ISO 8601 datetime string"
    }
  ]
}
```

---

### 3. Create Story

**Endpoint:** `POST /api/stories`

**Request Body:**

```json
{
  "content": "string (required, max 5000 chars)",
  "imageS3Key": "string (optional)",
  "videoS3Key": "string (optional)",
  "mode": "string (optional)",
  "birdIds": ["string"] // Required, at least 1 bird ID
}
```

**Expected Response:**

```json
{
  "storyId": "string",
  "message": "Story created successfully"
}
```

**Validation:**

- `content` is required and must not be empty
- `birdIds` must contain at least 1 valid bird ID
- Only one of `imageS3Key` or `videoS3Key` should be provided
- `mode` must be one of the valid mood types (if provided)
- User must own all birds in `birdIds`

---

### 4. Update Story

**Endpoint:** `PUT /api/stories/{storyId}`

**Request Body:**

```json
{
  "content": "string (required)",
  "imageS3Key": "string (optional)",
  "videoS3Key": "string (optional)",
  "mode": "string (optional)",
  "birdIds": ["string"] // Required, at least 1 bird ID
}
```

**Expected Response:**

- Status: `204 No Content` on success

**Validation:**

- Same as Create Story
- User must be the story owner

---

### 5. Delete Story

**Endpoint:** `DELETE /api/stories/{storyId}`

**Expected Response:**

- Status: `204 No Content` on success

**Validation:**

- User must be the story owner

---

### 6. Get My Stories

**Endpoint:** `GET /api/stories/my-stories`

**Expected Response:**

```json
[
  {
    "storyId": "string",
    "content": "string",
    "imageUrl": "string (optional)",
    "videoUrl": "string (optional)",
    "mode": "string (optional)",
    "likes": "number",
    "commentsCount": "number",
    "createdAt": "ISO 8601 datetime string",
    "title": "string (optional)"
  }
]
```

**Notes:**

- Should return all stories by authenticated user
- No pagination needed (user's own stories)

---

## Media/Video Requirements

### Video Files

- **Maximum Size:** 200MB (before upload to mobile)
- **Maximum Duration:** 60 seconds
- **Supported Formats:** .mp4, .mov, .m4v
- **Recommended Resolution:** 720p vertical (720x1280)
- **Aspect Ratio:** 9:16 (portrait/vertical) recommended

### Image Files

- **Maximum Size:** 5MB for stories
- **Supported Formats:** .jpg, .png, .webp
- **Recommended Aspect Ratio:** 4:5 (Instagram-style)

### S3 URLs

- All `imageUrl` and `videoUrl` fields should return pre-signed S3 URLs
- URLs should have sufficient expiration time (recommend 1 hour minimum)
- URLs should be ready for direct display/playback in video player

---

## Story Mood Types (mode field)

Valid values for the `mode` field:

1. `LoveAndBond` - ❤️ Love & Bond
2. `NewBeginning` - 🌱 New Beginning
3. `ProgressAndWins` - 🎯 Progress & Wins
4. `FunnyMoment` - 😄 Funny Moment
5. `PeacefulMoment` - 🕊️ Peaceful Moment
6. `LossAndMemory` - 🕯️ Loss & Memory
7. `CareAndHealth` - 🏥 Care & Health
8. `DailyLife` - 📅 Daily Life

---

## Authentication

All story endpoints (except GET stories list) require authentication:

- Use Bearer token in `Authorization` header
- Token should be obtained from login/register endpoints

---

## Error Responses

All endpoints should return consistent error format:

```json
{
  "error": "string",
  "message": "string (detailed error message)",
  "statusCode": "number"
}
```

**Common Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (user doesn't have permission)
- `404` - Not Found (story/resource doesn't exist)
- `500` - Internal Server Error

---

## Additional Notes

### Video Autoplay in Feed

- Videos in the story feed will autoplay when 60% visible
- Videos are muted during autoplay in feed
- Only one video plays at a time
- When video is not playing, thumbnail image is shown

### Pagination Behavior

- Frontend fetches page 1 on initial load
- Automatically loads next page when user scrolls near bottom (50% threshold)
- Pull-to-refresh resets to page 1

### Media Priority

- If both `imageUrl` and `videoUrl` are present, video takes priority
- Image is used as video thumbnail when video is not playing
- Stories can have image only, video only, or neither
