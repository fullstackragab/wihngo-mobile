# Story API - Quick Reference

## 📋 Quick Navigation

- [API Endpoints](#api-endpoints)
- [Common Operations](#common-operations)
- [Error Handling](#error-handling)
- [Testing Checklist](#testing-checklist)

---

## 🔗 API Endpoints

### GET /api/stories

**Paginated story list**

```typescript
const response = await storyService.getStories(1, 10);
// Returns: { page, pageSize, totalCount, items: Story[] }
// hasMore = (page * pageSize) < totalCount
```

### GET /api/stories/{id}

**Story detail**

```typescript
const story = await storyService.getStoryDetail(storyId);
// Returns: StoryDetailDto with full content, birds, author
```

### GET /api/stories/user/{userId}

**User's stories (paginated)**

```typescript
const response = await storyService.getUserStories(userId, 1, 10);
```

### GET /api/stories/my-stories

**Current user's stories (requires auth)**

```typescript
const response = await storyService.getMyStories(1, 10);
```

### POST /api/stories

**Create story**

```typescript
const story = await storyService.createStory({
  content: "Story text",
  birdIds: ["bird-id-1", "bird-id-2"],
  mode: StoryMode.FunnyMoment, // optional
  imageS3Key: "stories/abc123.jpg", // optional
  videoS3Key: null, // optional (image OR video, not both)
});
```

### PUT /api/stories/{id}

**Update story (only author)**

```typescript
await storyService.updateStory(storyId, {
  content: "Updated text", // optional
  mode: StoryMode.PeacefulMoment, // optional
  // All fields optional for partial updates
});
```

### DELETE /api/stories/{id}

**Delete story (only author)**

```typescript
await storyService.deleteStory(storyId);
// Automatically deletes media from S3
```

---

## 🎯 Common Operations

### Upload and Create Story

```typescript
// Step 1: Upload media (if present)
let imageS3Key: string | undefined;
if (imageUri) {
  imageS3Key = await mediaService.uploadFile(imageUri, "story");
}

// Step 2: Create story
const story = await storyService.createStory({
  content: content.trim(),
  birdIds: selectedBirds.map((b) => b.birdId),
  mode: selectedMood,
  imageS3Key: imageS3Key,
});
```

### Pagination with Infinite Scroll

```typescript
const [stories, setStories] = useState<Story[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadStories = async (page: number) => {
  const response = await storyService.getStories(page, 10);

  if (page === 1) {
    setStories(response.items);
  } else {
    setStories((prev) => [...prev, ...response.items]);
  }

  setCurrentPage(response.page);
  setTotalCount(response.totalCount);
  setHasMore(response.page * response.pageSize < response.totalCount);
};

// In FlatList
<FlatList
  data={stories}
  onEndReached={() => hasMore && loadStories(currentPage + 1)}
  onEndReachedThreshold={0.5}
/>;
```

### Calculate hasMore

```typescript
const hasMore = page * pageSize < totalCount;
```

---

## ⚠️ Error Handling

### Common Error Responses

```typescript
try {
  await storyService.createStory(data);
} catch (error: any) {
  if (error?.message?.includes("both")) {
    // "Story can have either an image or a video, not both"
  } else if (error?.message?.includes("bird")) {
    // "At least one bird must be selected"
  } else if (error?.message?.includes("content")) {
    // "Story content cannot be empty"
  } else if (error?.message?.includes("S3")) {
    // "Story image not found in S3"
  } else if (error?.message?.includes("403")) {
    // "Forbidden" - not the author
  } else if (error?.message?.includes("404")) {
    // "Story not found"
  }
}
```

### HTTP Status Codes

- **200 OK** - Success (GET)
- **201 Created** - Story created
- **204 No Content** - Update/delete success
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Missing/invalid auth
- **403 Forbidden** - Not the author
- **404 Not Found** - Story doesn't exist
- **500 Internal Server Error** - Server error

---

## ✅ Testing Checklist

### Stories Feed

- [ ] Load initial stories (page 1)
- [ ] Infinite scroll loads more
- [ ] Pull-to-refresh resets to page 1
- [ ] Video autoplays at 60% visibility
- [ ] Only one video plays at a time
- [ ] Tap story to view details

### Create Story

- [ ] Validation: content required
- [ ] Validation: at least 1 bird required
- [ ] Validation: max 5000 characters
- [ ] Validation: image OR video (not both)
- [ ] Upload image successfully
- [ ] Upload video successfully
- [ ] Select mood/mode
- [ ] Create story and redirect

### Story Detail

- [ ] View full content
- [ ] See tagged birds
- [ ] See author name
- [ ] See formatted date
- [ ] Play video (if present)
- [ ] Like/comment show "Coming Soon"

### My Stories

- [ ] Load my stories list
- [ ] Delete story (with confirmation)
- [ ] Verify only author can delete
- [ ] Edit story (redirect to edit screen)

### Error Scenarios

- [ ] No internet connection
- [ ] Expired auth token
- [ ] Try to edit someone else's story (403)
- [ ] Invalid story ID (404)
- [ ] Upload file too large
- [ ] Create story with both image and video

---

## 📝 Important Notes

### Pre-signed URLs

- Expire in **10 minutes**
- Regenerated on each API call
- No local caching implemented

### Media Guidelines

**Images:**

- Max 5MB
- .jpg, .png, .webp
- Aspect ratio: 4:5

**Videos:**

- Max 200MB
- Max 60 seconds
- .mp4, .mov, .m4v
- Resolution: 720p (720x1280)
- Aspect ratio: 9:16

### Validation Rules

**Creating:**

- Content required (not empty)
- At least 1 bird required
- Image OR video (not both)
- Mode optional
- Max 5000 chars

**Updating:**

- All fields optional
- New image removes video
- New video removes image
- Empty string "" removes media
- Only author can update

**Deleting:**

- Only author can delete
- Auto-removes media from S3
- Returns 204 on success

---

## 🚧 Features NOT Yet Implemented

These features show placeholders but are not functional:

- ❌ Likes/reactions (shows "Coming Soon")
- ❌ Comments (shows "Coming Soon")
- ❌ User avatars (only name displayed)

---

## 📊 Data Structure

### Story (List Item)

```typescript
{
  storyId: string;
  birds: string[]; // Names only
  mode?: StoryMode | null;
  date: string; // "December 25, 2024"
  preview: string; // Truncated to 140 chars
  imageS3Key?: string | null;
  imageUrl?: string | null; // Pre-signed, 10 min
  videoS3Key?: string | null;
  videoUrl?: string | null; // Pre-signed, 10 min
}
```

### StoryDetailDto

```typescript
{
  storyId: string;
  content: string; // Full content
  mode?: StoryMode | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string; // ISO 8601
  birds: StoryBird[]; // Full details
  author: {
    userId: string;
    name: string; // No avatar yet
  };
}
```

### StoryListResponse

```typescript
{
  page: number;
  pageSize: number;
  totalCount: number;
  items: Story[];
}
```

---

## 🔧 Modified Files

1. ✅ `types/story.ts` - Updated types
2. ✅ `services/story.service.ts` - All endpoints
3. ✅ `services/media.service.ts` - New upload flow
4. ✅ `app/(tabs)/stories.tsx` - Pagination
5. ✅ `app/story/[id].tsx` - Detail view
6. ✅ `app/create-story.tsx` - Creation flow
7. ✅ `app/my-stories.tsx` - My stories list
8. ✅ `components/story-card-with-video.tsx` - Card display

---

**Last Updated:** December 14, 2025  
**Version:** 1.0
