# Like and Comment System - Mobile Implementation

## Overview

The Like and Comment system has been fully implemented for the mobile app with the following components:

### 📁 Files Created

1. **Types** - `types/like-comment.ts`

   - All TypeScript types and interfaces for likes and comments
   - API request/response types
   - Constants for validation

2. **Services**

   - `services/like.service.ts` - Story like operations
   - `services/comment.service.ts` - Comment and comment like operations

3. **Components**

   - `components/story-like-button.tsx` - Story like button with optimistic updates
   - `components/comment-input.tsx` - Comment/reply input with character limit
   - `components/comment-item.tsx` - Single comment with replies, edit, delete, and like
   - `components/comment-list.tsx` - Full comment list with pagination

4. **Type Updates**
   - Updated `types/story.ts` to include `likeCount` and `commentCount` fields

---

## 🚀 Quick Start

### 1. Using the Story Like Button

```tsx
import StoryLikeButton from "@/components/story-like-button";
import { likeService } from "@/services/like.service";
import { useState, useEffect } from "react";

function StoryScreen({ storyId }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Check like status on mount (if user is authenticated)
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const status = await likeService.checkStoryLikeStatus(storyId);
        setIsLiked(status.isLiked);
      } catch (error) {
        console.log("Not authenticated or error checking status");
      }
    };
    checkLikeStatus();
  }, [storyId]);

  return (
    <StoryLikeButton
      storyId={storyId}
      initialIsLiked={isLiked}
      initialLikeCount={likeCount}
      onLikeChange={(isLiked, newCount) => {
        setIsLiked(isLiked);
        setLikeCount(newCount);
      }}
      variant="default" // or "compact"
      showCount={true}
    />
  );
}
```

### 2. Using the Comment List

```tsx
import CommentList from "@/components/comment-list";

function StoryDetailScreen({ storyId }) {
  const [commentCount, setCommentCount] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      {/* Your story content */}

      <CommentList
        storyId={storyId}
        showInput={true}
        onCommentCountChange={(count) => setCommentCount(count)}
      />
    </View>
  );
}
```

### 3. Complete Story Detail Integration Example

```tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { storyService } from "@/services/story.service";
import { likeService } from "@/services/like.service";
import { StoryDetailDto } from "@/types/story";
import StoryLikeButton from "@/components/story-like-button";
import CommentList from "@/components/comment-list";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<StoryDetailDto | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (id) {
      loadStory();
      checkLikeStatus();
    }
  }, [id]);

  const loadStory = async () => {
    try {
      const data = await storyService.getStoryDetail(id!);
      setStory(data);
      setLikeCount(data.likeCount || 0);
      setCommentCount(data.commentCount || 0);
    } catch (error) {
      console.error("Error loading story:", error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const status = await likeService.checkStoryLikeStatus(id!);
      setIsLiked(status.isLiked);
    } catch (error) {
      // User not authenticated or error
      console.log("Could not check like status");
    }
  };

  if (!story) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Story Content */}
        <View style={styles.storyContent}>
          <Text style={styles.title}>{story.content}</Text>
          {/* Add images, videos, etc. */}
        </View>

        {/* Like and Comment Stats */}
        <View style={styles.statsBar}>
          <StoryLikeButton
            storyId={story.storyId}
            initialIsLiked={isLiked}
            initialLikeCount={likeCount}
            onLikeChange={(liked, count) => {
              setIsLiked(liked);
              setLikeCount(count);
            }}
            variant="default"
          />
          <Text style={styles.commentStat}>
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </Text>
        </View>

        {/* Comments Section */}
        <CommentList
          storyId={story.storyId}
          showInput={true}
          onCommentCountChange={setCommentCount}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  storyContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  commentStat: {
    fontSize: 14,
    color: "#666",
  },
});
```

---

## 📚 API Service Methods

### Like Service (`services/like.service.ts`)

```typescript
// Get all likes for a story
likeService.getStoryLikes(storyId, page?, pageSize?)

// Like a story
likeService.likeStory(storyId)

// Unlike a story
likeService.unlikeStory(storyId)

// Check if user liked a story
likeService.checkStoryLikeStatus(storyId)

// Get user's liked stories
likeService.getMyLikedStories(page?, pageSize?)

// Toggle like (convenience method)
likeService.toggleStoryLike(storyId, currentlyLiked)
```

### Comment Service (`services/comment.service.ts`)

```typescript
// Get story comments (top-level only)
commentService.getStoryComments(storyId, page?, pageSize?)

// Get single comment with all replies
commentService.getCommentWithReplies(commentId)

// Get comment replies (paginated)
commentService.getCommentReplies(commentId, page?, pageSize?)

// Create comment or reply
commentService.createComment({
  storyId,
  content,
  parentCommentId? // null for top-level, commentId for reply
})

// Update comment
commentService.updateComment(commentId, { content })

// Delete comment (cascade deletes replies)
commentService.deleteComment(commentId)

// Get comment likes
commentService.getCommentLikes(commentId, page?, pageSize?)

// Like a comment
commentService.likeComment(commentId)

// Unlike a comment
commentService.unlikeComment(commentId)

// Toggle comment like (convenience method)
commentService.toggleCommentLike(commentId, currentlyLiked)
```

---

## 🎨 Component Props

### StoryLikeButton

| Prop               | Type                          | Default     | Description                |
| ------------------ | ----------------------------- | ----------- | -------------------------- |
| `storyId`          | `string`                      | required    | UUID of the story          |
| `initialIsLiked`   | `boolean`                     | `false`     | Initial like state         |
| `initialLikeCount` | `number`                      | `0`         | Initial like count         |
| `onLikeChange`     | `(isLiked, newCount) => void` | -           | Callback when like changes |
| `variant`          | `"default" \| "compact"`      | `"default"` | Button style variant       |
| `style`            | `ViewStyle`                   | -           | Custom style               |
| `disabled`         | `boolean`                     | `false`     | Disable interactions       |
| `showCount`        | `boolean`                     | `true`      | Show like count            |

### CommentList

| Prop                   | Type              | Default  | Description                 |
| ---------------------- | ----------------- | -------- | --------------------------- |
| `storyId`              | `string`          | required | UUID of the story           |
| `pageSize`             | `number`          | `20`     | Comments per page           |
| `showInput`            | `boolean`         | `true`   | Show comment input field    |
| `onCommentCountChange` | `(count) => void` | -        | Callback when count changes |

### CommentItem

| Prop           | Type                                  | Default  | Description                |
| -------------- | ------------------------------------- | -------- | -------------------------- |
| `comment`      | `Comment`                             | required | Comment object             |
| `onReply`      | `(commentId, userName) => void`       | -        | Callback for reply action  |
| `onDelete`     | `(commentId) => void`                 | -        | Callback after delete      |
| `onUpdate`     | `(commentId, content) => void`        | -        | Callback after update      |
| `onLikeChange` | `(commentId, isLiked, count) => void` | -        | Callback when like changes |
| `depth`        | `number`                              | `0`      | Nesting depth              |
| `showReplies`  | `boolean`                             | `true`   | Show reply functionality   |

### CommentInput

| Prop            | Type                         | Default              | Description               |
| --------------- | ---------------------------- | -------------------- | ------------------------- |
| `onSubmit`      | `(content) => Promise<void>` | required             | Submit handler            |
| `placeholder`   | `string`                     | `"Add a comment..."` | Input placeholder         |
| `replyingTo`    | `string \| null`             | `null`               | Username being replied to |
| `onCancelReply` | `() => void`                 | -                    | Cancel reply handler      |
| `style`         | `ViewStyle`                  | -                    | Custom style              |
| `autoFocus`     | `boolean`                    | `false`              | Auto focus input          |

---

## 🎯 Features

### Story Likes

✅ Like/unlike stories with optimistic UI updates
✅ View like counts
✅ Check personal like status
✅ View list of users who liked
✅ View all stories you've liked
✅ Automatic authentication handling
✅ Error handling with user feedback

### Comments

✅ Create top-level comments
✅ Reply to comments (nested up to 3 levels)
✅ Edit your own comments
✅ Delete your own comments (cascade deletes replies)
✅ Like/unlike comments
✅ View comment like counts
✅ Paginated comment loading
✅ Pull-to-refresh
✅ Infinite scroll for more comments
✅ Character limit validation (2000 chars)
✅ Real-time reply count updates
✅ Optimistic UI updates
✅ "Edited" indicator for modified comments

---

## 🔒 Authentication

All like and comment actions require authentication. The components automatically:

- Check if user is authenticated before actions
- Show sign-in prompts for unauthenticated users
- Handle session expiration gracefully
- Redirect to login when needed

---

## 🎨 Customization

### Styling

All components use StyleSheet and can be customized via the `style` prop:

```tsx
<StoryLikeButton storyId={storyId} style={{ backgroundColor: "#custom" }} />
```

### Colors

Default colors used:

- Like/Heart: `#FF6B9D`
- Primary Blue: `#4A90E2`
- Text: `#333`, `#666`, `#999`
- Error: `#FF6B6B`

You can override these in the component files or create a theme context.

---

## ⚡ Performance Optimizations

1. **Optimistic UI Updates** - Immediate feedback before server response
2. **Pagination** - Load comments in chunks
3. **Lazy Loading** - Replies loaded on demand
4. **Memoization** - React performance optimizations
5. **Debouncing** - Prevent rapid-fire requests
6. **Error Recovery** - Automatic rollback on failure

---

## 🐛 Error Handling

All services and components handle:

- Network errors
- Authentication failures (401)
- Permission errors (403)
- Not found errors (404)
- Conflict errors (409 - already liked)
- Validation errors (400)

Errors are shown to users via:

- `Alert.alert()` for critical errors
- Inline error messages for form validation
- Automatic state rollback on failure

---

## 📱 Updating Existing Story Screen

To integrate into your existing story detail screen at `app/story/[id].tsx`:

1. Import the new components:

```tsx
import StoryLikeButton from "@/components/story-like-button";
import CommentList from "@/components/comment-list";
import { likeService } from "@/services/like.service";
```

2. Add state for likes:

```tsx
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(story?.likeCount || 0);
const [commentCount, setCommentCount] = useState(story?.commentCount || 0);
```

3. Check like status:

```tsx
useEffect(() => {
  if (story?.storyId) {
    likeService
      .checkStoryLikeStatus(story.storyId)
      .then((status) => setIsLiked(status.isLiked))
      .catch(() => console.log("Not authenticated"));
  }
}, [story?.storyId]);
```

4. Replace old comment UI with:

```tsx
<StoryLikeButton
  storyId={story.storyId}
  initialIsLiked={isLiked}
  initialLikeCount={likeCount}
  onLikeChange={(liked, count) => {
    setIsLiked(liked);
    setLikeCount(count);
  }}
/>

<CommentList
  storyId={story.storyId}
  onCommentCountChange={setCommentCount}
/>
```

---

## ✅ Testing Checklist

- [ ] Like a story (authenticated)
- [ ] Unlike a story
- [ ] Try to like without authentication
- [ ] View list of users who liked
- [ ] Post a top-level comment
- [ ] Reply to a comment
- [ ] Edit your own comment
- [ ] Delete your own comment
- [ ] Try to edit/delete others' comments (should fail)
- [ ] Like a comment
- [ ] Unlike a comment
- [ ] Load more comments (pagination)
- [ ] View nested replies (3 levels deep)
- [ ] Test character limit (2000 chars)
- [ ] Pull to refresh comments
- [ ] Test offline behavior
- [ ] Test session expiration

---

## 📞 Support

For backend API issues or questions, refer to the main API documentation.

For mobile app issues:

- Check console logs for detailed error messages
- Verify authentication token is valid
- Ensure API base URL is correct in config
- Test network connectivity

---

**Implementation Complete! 🎉**

All components are ready to use. Import and integrate them into your story screens to enable full like and comment functionality.
