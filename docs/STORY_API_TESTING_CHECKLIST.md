# Story API Testing Checklist ✅

## 🎯 Overview

Use this checklist to verify all Story API features are working correctly after the integration.

---

## 📋 Story Creation Tests

### Basic Creation

- [ ] Open create story screen
- [ ] Verify no title field exists
- [ ] Write story content
- [ ] Verify character counter shows `0/5000` and updates as you type
- [ ] Verify "Post" button is disabled when:
  - [ ] Content is empty
  - [ ] No birds are selected
- [ ] Select at least 1 bird
- [ ] Verify "Post" button becomes enabled

### Multiple Birds

- [ ] Select 2+ birds
- [ ] Verify all selected birds show as chips
- [ ] Remove a bird by tapping X on chip
- [ ] Add bird back
- [ ] Verify checkmarks show in bird modal for selected birds
- [ ] Post story successfully

### Mood Selection (Optional)

- [ ] Tap "Choose a mood"
- [ ] Verify modal opens with 8 mood options
- [ ] Verify large emojis are displayed (48px size)
- [ ] Long-press a mood card
- [ ] Verify description and example appear below the mood
- [ ] Select a mood
- [ ] Verify mood badge appears with emoji + label
- [ ] Tap "Change" to open mood selector again
- [ ] Select different mood
- [ ] Verify mood badge updates
- [ ] Tap X to remove mood
- [ ] Verify mood badge disappears
- [ ] Tap "Choose a mood" again
- [ ] Tap "Skip / No Mood"
- [ ] Verify no mood is selected
- [ ] Post story without mood successfully

### Image Upload

- [ ] Tap "Add Photo"
- [ ] Choose "Take Photo" or "Choose from Library"
- [ ] Select/take a photo
- [ ] Verify image preview displays
- [ ] Tap "Remove" button
- [ ] Verify image is removed
- [ ] Add image again
- [ ] Post story with image successfully

### Validation Tests

- [ ] Try to post with empty content → Should show error notification
- [ ] Try to post with no birds selected → Should show "Bird Required" error
- [ ] Type more than 5000 characters → Verify counter turns red (or appropriate styling)
- [ ] Try to post with 5001+ characters → Should show "Content Too Long" error
- [ ] Post story with exactly 5000 characters → Should succeed

---

## 📖 Story Display Tests

### Story Detail View

- [ ] Open a story with 1 bird
- [ ] Verify bird card displays with:
  - [ ] Bird avatar/image
  - [ ] Bird name
  - [ ] Bird species (if available)
- [ ] Tap bird card → Should navigate to bird profile
- [ ] Go back and open story with multiple birds
- [ ] Verify multiple bird cards display horizontally
- [ ] Scroll horizontally through bird cards
- [ ] Tap each bird card → Navigates to correct bird profile

### Mood Display

- [ ] Open story with mood
- [ ] Verify mood badge displays below birds section
- [ ] Verify emoji + label are visible
- [ ] Open story without mood
- [ ] Verify NO mood badge displays (nothing shown)

### Content Display

- [ ] Verify full story content displays
- [ ] Verify content is readable (good font size/line height)
- [ ] Verify image displays if present
- [ ] Verify image can be tapped for fullscreen (if implemented)

### Author Info

- [ ] Verify author name displays at top
- [ ] Verify formatted date displays
- [ ] Verify author avatar displays (or placeholder icon)

### Actions

- [ ] Tap Like button (placeholder alert is OK for now)
- [ ] Verify comment count displays
- [ ] Tap comment icon → Scrolls to comments section
- [ ] Tap share button (placeholder is OK for now)

---

## 🏠 Story List/Feed Tests

### Bird Profile Stories

- [ ] Navigate to a bird profile
- [ ] Verify stories section displays
- [ ] Verify story cards show:
  - [ ] Preview text (not title)
  - [ ] Formatted date
  - [ ] Thumbnail image (if present)
- [ ] Tap story card → Opens story detail
- [ ] If bird has 0 stories:
  - [ ] Verify "No stories yet" message displays
  - [ ] Verify "Create Story" button displays

### Story Highlights (Premium Birds)

- [ ] Open premium bird profile
- [ ] Verify "Story Highlights" section displays
- [ ] Verify up to 3 highlighted stories show
- [ ] Verify each shows:
  - [ ] Preview text
  - [ ] Date
  - [ ] Thumbnail image or placeholder
- [ ] If no highlights:
  - [ ] Verify empty state with bookmark icon
  - [ ] Verify "No highlighted stories yet" message

---

## ✏️ Story Update Tests (If Implemented)

- [ ] Open your own story
- [ ] Tap Edit button
- [ ] Update content
- [ ] Change mood
- [ ] Add/remove birds
- [ ] Add/remove image
- [ ] Save changes
- [ ] Verify updates display correctly

---

## 🗑️ Story Delete Tests

- [ ] Open your own story
- [ ] Tap Delete button
- [ ] Confirm deletion
- [ ] Verify story is removed from lists
- [ ] Verify associated image is removed

---

## 🎨 UX/UI Tests

### Visual Design

- [ ] Mood badges have light background (#F0F9F9)
- [ ] Mood badges have emoji + text
- [ ] Emojis are large and clear in mood selector (48px)
- [ ] Bird chips have bird thumbnails + names
- [ ] Character counter is visible and updates in real-time
- [ ] Optional labels are styled differently than required labels

### Interactions

- [ ] All buttons have appropriate disabled states
- [ ] Loading indicators display during API calls
- [ ] Error notifications display clearly
- [ ] Success notifications display after posting
- [ ] Modal animations are smooth
- [ ] Scrolling is smooth in:
  - [ ] Bird list
  - [ ] Story detail
  - [ ] Mood selector

### Responsiveness

- [ ] UI works on different screen sizes
- [ ] Keyboard doesn't hide input fields
- [ ] Images scale properly
- [ ] Long bird names don't break layout
- [ ] Long content wraps properly

---

## 🔄 Backward Compatibility Tests

### Legacy API Support

- [ ] View stories created with old API (with title)
- [ ] Verify they display correctly (using preview/content fallback)
- [ ] View stories with single bird (old format)
- [ ] Verify single bird displays correctly
- [ ] View stories with old date format
- [ ] Verify date displays correctly

---

## 🐛 Edge Cases

### Empty States

- [ ] User has no birds → Create story shows "Add Bird" prompt
- [ ] Story has no content → Should not be allowed
- [ ] Story has no image → Displays without image (OK)
- [ ] Story has no mood → Displays without mood badge (OK)

### Network Issues

- [ ] Disable network
- [ ] Try to create story → Should show error
- [ ] Try to load story → Should show error
- [ ] Re-enable network
- [ ] Retry operations → Should succeed

### Data Issues

- [ ] Story with missing bird data → Should handle gracefully
- [ ] Story with invalid mood value → Should handle gracefully
- [ ] Story with broken image URL → Should show placeholder

---

## 📊 Performance Tests

- [ ] Create story with multiple birds (5+) → Should not lag
- [ ] Upload large image (4-5MB) → Should show progress
- [ ] Scroll through long story content → Should be smooth
- [ ] Open story with multiple birds → Should load quickly
- [ ] Switch between stories rapidly → Should not crash

---

## 🔐 Permission Tests

### Owner Permissions

- [ ] View your own story → See edit/delete buttons
- [ ] Edit your own story → Should succeed
- [ ] Delete your own story → Should succeed

### Non-Owner Permissions

- [ ] View someone else's story → No edit/delete buttons
- [ ] Try to edit someone else's story (if possible) → Should fail
- [ ] Try to delete someone else's story (if possible) → Should fail

---

## 📱 Platform-Specific Tests

### iOS

- [ ] Keyboard behavior correct
- [ ] Modal presentations smooth
- [ ] Image picker works
- [ ] Back navigation works
- [ ] Safe area insets respected

### Android

- [ ] Keyboard behavior correct
- [ ] Modal presentations smooth
- [ ] Image picker works
- [ ] Back button works
- [ ] Status bar displays correctly

---

## ✅ Final Verification

- [ ] All required features working
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] API calls use correct endpoints
- [ ] Loading states display properly
- [ ] Error handling works correctly
- [ ] UI matches design specifications
- [ ] Performance is acceptable
- [ ] No memory leaks observed

---

## 🐛 Bug Report Template

If you find a bug, report it with:

```
**Title:** [Brief description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Device Info:**
- Device: [iPhone 14 Pro / Samsung S23 / etc.]
- OS: [iOS 17.1 / Android 14]
- App Version: [1.0.0]

**Additional Context:**
[Any other relevant information]
```

---

## 📞 Questions?

If you encounter issues or have questions:

1. Check [STORY_API_IMPLEMENTATION_SUMMARY.md](./STORY_API_IMPLEMENTATION_SUMMARY.md)
2. Check [STORY_API_QUICK_REF.md](./STORY_API_QUICK_REF.md)
3. Contact the development team

---

**Last Updated:** December 14, 2025  
**Version:** 1.0
