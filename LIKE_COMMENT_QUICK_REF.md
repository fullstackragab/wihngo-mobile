# Like & Comment System - Quick Reference

## 🚀 Quick Integration

### Option 1: Using Components (Easiest)

```tsx
import StoryLikeButton from "@/components/story-like-button";
import CommentList from "@/components/comment-list";

function StoryScreen({ storyId }) {
  return (
    <>
      <StoryLikeButton storyId={storyId} initialLikeCount={story.likeCount} />
      <CommentList storyId={storyId} />
    </>
  );
}
```

### Option 2: Using Hooks (More Control)

```tsx
import { useStoryLikes } from "@/hooks/use-story-likes";
import { useStoryComments } from "@/hooks/use-story-comments";

function StoryScreen({ storyId, initialLikeCount }) {
  const { isLiked, likeCount, toggleLike } = useStoryLikes({
    storyId,
    initialLikeCount,
  });

  const { comments, addComment, refresh } = useStoryComments({
    storyId,
    autoLoad: true,
  });

  return (
    <>
      <TouchableOpacity onPress={toggleLike}>
        <Text>
          {isLiked ? "❤️" : "🤍"} {likeCount}
        </Text>
      </TouchableOpacity>

      {comments.map((comment) => (
        <Text key={comment.commentId}>{comment.content}</Text>
      ))}
    </>
  );
}
```

### Option 3: Using Services Directly (Full Control)

```tsx
import { likeService } from "@/services/like.service";
import { commentService } from "@/services/comment.service";

// Like a story
await likeService.likeStory(storyId);

// Post a comment
await commentService.createComment({
  storyId,
  content: "Great story!",
  parentCommentId: null,
});
```

---

## 📦 What Was Added

### New Files

- `types/like-comment.ts` - All TypeScript types
- `services/like.service.ts` - Like API calls
- `services/comment.service.ts` - Comment API calls
- `components/story-like-button.tsx` - Like button UI
- `components/comment-input.tsx` - Comment input UI
- `components/comment-item.tsx` - Single comment UI
- `components/comment-list.tsx` - Full comment list UI
- `hooks/use-story-likes.ts` - Like state management hook
- `hooks/use-story-comments.ts` - Comment state management hook

### Updated Files

- `types/story.ts` - Added `likeCount` and `commentCount` fields
- `types/index.ts` - Exported like-comment types

---

## 🎯 Common Use Cases

### 1. Add Like Button to Story Card

```tsx
import StoryLikeButton from "@/components/story-like-button";

<StoryLikeButton
  storyId={story.storyId}
  initialLikeCount={story.likeCount}
  variant="compact"
  showCount={true}
/>;
```

### 2. Full Comment Section

```tsx
import CommentList from "@/components/comment-list";

<CommentList
  storyId={story.storyId}
  showInput={true}
  onCommentCountChange={(count) => console.log("Comments:", count)}
/>;
```

### 3. Check Like Status

```tsx
import { likeService } from "@/services/like.service";

const status = await likeService.checkStoryLikeStatus(storyId);
if (status.isLiked) {
  console.log("User liked this story!");
}
```

### 4. Post a Comment

```tsx
import { commentService } from "@/services/comment.service";

await commentService.createComment({
  storyId: "abc-123",
  content: "This is a great story!",
  parentCommentId: null, // null = top-level comment
});
```

### 5. Reply to a Comment

```tsx
await commentService.createComment({
  storyId: "abc-123",
  content: "I agree!",
  parentCommentId: "comment-id-here", // This makes it a reply
});
```

### 6. Like a Comment

```tsx
await commentService.likeComment(commentId);
```

### 7. Get My Liked Stories

```tsx
const likedStories = await likeService.getMyLikedStories(1, 20);
console.log(likedStories.items);
```

---

## 🎨 Component Variants

### StoryLikeButton Variants

```tsx
// Default (button style)
<StoryLikeButton storyId={id} variant="default" />

// Compact (icon + count)
<StoryLikeButton storyId={id} variant="compact" />
```

---

## 🔐 Authentication

All components handle authentication automatically:

- Show sign-in prompt if not logged in
- Handle session expiration
- Redirect to login page when needed

No need to check authentication yourself!

---

## ⚡ Performance Features

- ✅ Optimistic UI updates (instant feedback)
- ✅ Pagination for comments
- ✅ Lazy loading of replies
- ✅ Pull-to-refresh
- ✅ Infinite scroll
- ✅ Automatic error rollback

---

## 🐛 Error Handling

All errors are handled automatically:

- Network errors
- Authentication failures
- Validation errors
- Permission denied

Users see friendly error messages via Alert dialogs.

---

## 📊 Story Type Updates

The `Story` and `StoryDetailDto` types now include:

```typescript
{
  likeCount?: number;      // Total likes on story
  commentCount?: number;   // Total top-level comments
}
```

These are automatically returned by the backend API.

---

## 🔧 API Endpoints Used

### Story Likes

- `GET /api/likes/story/{storyId}` - Get story likes
- `POST /api/likes/story` - Like a story
- `DELETE /api/likes/story/{storyId}` - Unlike a story
- `GET /api/likes/story/{storyId}/check` - Check like status
- `GET /api/likes/my-likes` - Get my liked stories

### Comments

- `GET /api/comments/story/{storyId}` - Get story comments
- `GET /api/comments/{commentId}` - Get comment with replies
- `GET /api/comments/{commentId}/replies` - Get comment replies
- `POST /api/comments` - Create comment/reply
- `PUT /api/comments/{commentId}` - Update comment
- `DELETE /api/comments/{commentId}` - Delete comment

### Comment Likes

- `GET /api/comments/{commentId}/likes` - Get comment likes
- `POST /api/comments/{commentId}/like` - Like comment
- `DELETE /api/comments/{commentId}/like` - Unlike comment

---

## 📝 Validation Rules

### Comments

- Max length: 2000 characters
- Cannot be empty or whitespace only
- Must be authenticated to post

### Likes

- One like per user per story/comment
- Must be authenticated
- Cannot like your own content (enforced by backend)

---

## 🎓 Full Example: Story Detail Screen

```tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { storyService } from "@/services/story.service";
import { useStoryLikes } from "@/hooks/use-story-likes";
import StoryLikeButton from "@/components/story-like-button";
import CommentList from "@/components/comment-list";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  const { isLiked, likeCount, toggleLike } = useStoryLikes({
    storyId: id!,
    initialLikeCount: story?.likeCount || 0,
  });

  useEffect(() => {
    storyService.getStoryDetail(id!).then((data) => {
      setStory(data);
      setCommentCount(data.commentCount || 0);
    });
  }, [id]);

  if (!story) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      {/* Story Header */}
      <View>
        <Text>{story.author.name}</Text>
        {story.imageUrl && <Image source={{ uri: story.imageUrl }} />}
        <Text>{story.content}</Text>
      </View>

      {/* Like Button */}
      <StoryLikeButton
        storyId={story.storyId}
        initialIsLiked={isLiked}
        initialLikeCount={likeCount}
      />

      {/* Comment Stats */}
      <Text>{commentCount} comments</Text>

      {/* Comments */}
      <CommentList
        storyId={story.storyId}
        onCommentCountChange={setCommentCount}
      />
    </ScrollView>
  );
}
```

---

## ✅ Testing Checklist

After integration, test:

- [ ] Like/unlike a story
- [ ] Post a comment
- [ ] Reply to a comment
- [ ] Edit your comment
- [ ] Delete your comment
- [ ] Like a comment
- [ ] Load more comments
- [ ] View nested replies
- [ ] Try actions without login (should prompt)

---

## 🆘 Troubleshooting

### "Session expired" errors

- User needs to log in again
- Components handle this automatically

### Comments not loading

- Check API base URL in config
- Verify storyId is valid UUID
- Check network connectivity

### Likes not updating

- Ensure authentication token is valid
- Check if story exists
- Look for console error messages

---

## 📚 More Info

See `LIKE_COMMENT_MOBILE_IMPLEMENTATION.md` for:

- Detailed API documentation
- Full component props
- Advanced customization
- Performance tips
- Architecture details

---

**Ready to use! Import and integrate into your screens.** 🚀
