# AI Story Generation - Backend Requirements

## Overview

This document outlines the backend API requirements for the AI Story Generation feature in Wihngo. This feature allows users to generate personalized story content based on their bird's profile, an uploaded image/video, and a selected mood.

---

## API Endpoint

### `POST /api/stories/generate`

Generates AI-powered story content based on the provided context.

---

## Request

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body

```typescript
interface GenerateStoryRequest {
  birdId: string;           // REQUIRED: The bird to generate a story about
  mode?: StoryMode | null;  // OPTIONAL: The mood/tone of the story
  imageS3Key?: string;      // OPTIONAL: S3 key of uploaded image for context
  videoS3Key?: string;      // OPTIONAL: S3 key of uploaded video for context
  language?: string;        // OPTIONAL: Language code (e.g., "en", "es", "fr"). Default: "en"
}
```

### StoryMode Enum Values
```typescript
enum StoryMode {
  LoveAndBond = "LoveAndBond",
  NewBeginning = "NewBeginning",
  ProgressAndWins = "ProgressAndWins",
  FunnyMoment = "FunnyMoment",
  PeacefulMoment = "PeacefulMoment",
  LossAndMemory = "LossAndMemory",
  CareAndHealth = "CareAndHealth",
  DailyLife = "DailyLife"
}
```

---

## Response

### Success Response (200 OK)

```typescript
interface GenerateStoryResponse {
  generatedContent: string;  // The AI-generated story content (max 5000 chars)
  tokensUsed?: number;       // OPTIONAL: Number of AI tokens consumed
  generationId?: string;     // OPTIONAL: Unique ID for tracking/analytics
}
```

### Example Success Response
```json
{
  "generatedContent": "Today was one of those magical moments with Charlie. As the morning sun streamed through the window, my little budgie decided it was the perfect time to show off his new trick. After weeks of patient training, he finally stepped onto my finger without hesitation. His tiny feet felt so warm, and those bright eyes looked at me with what I can only describe as pure trust. These small victories remind me why I love sharing my life with this feathered friend. Every day brings a new adventure, and I wouldn't have it any other way.",
  "tokensUsed": 150,
  "generationId": "gen_abc123xyz"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "BadRequest",
  "message": "birdId is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not own this bird"
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Bird not found"
}
```

### 429 Too Many Requests (Rate Limiting)
```json
{
  "error": "TooManyRequests",
  "message": "AI generation limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalError",
  "message": "Failed to generate story content"
}
```

### 503 Service Unavailable
```json
{
  "error": "ServiceUnavailable",
  "message": "AI service temporarily unavailable"
}
```

---

## Backend Implementation Requirements

### 1. Bird Context Retrieval

When generating content, the backend should fetch and include the following bird data in the AI prompt:

```typescript
interface BirdContext {
  name: string;              // Bird's name
  species: string;           // Species (e.g., "Budgerigar")
  commonName?: string;       // Common name if different
  scientificName?: string;   // Scientific name
  tagline?: string;          // Bird's tagline/short description
  description?: string;      // Full description
  age?: string;              // Age (e.g., "2 years old")
  location?: string;         // Location
  isMemorial?: boolean;      // If the bird has passed away
}
```

### 2. Image/Video Analysis (Vision AI)

If `imageS3Key` or `videoS3Key` is provided:

- **For images**: Use vision capabilities to analyze the image and include relevant details in the prompt
  - Detect bird's posture, activity, environment, colors, etc.
  - Include these observations in the story generation context

- **For videos**: Either:
  - Extract key frames and analyze them
  - Or use video understanding capabilities if available
  - Include detected activities, movements, interactions in the context

### 3. Mood-Based Prompt Engineering

The `mode` parameter should influence the tone and style of the generated content:

| Mode | Tone & Style Guidelines |
|------|------------------------|
| `LoveAndBond` | Warm, affectionate, emotional. Focus on connection, trust, cuddles |
| `NewBeginning` | Hopeful, excited, welcoming. Focus on first moments, new journey |
| `ProgressAndWins` | Celebratory, proud, encouraging. Focus on achievements, milestones |
| `FunnyMoment` | Playful, humorous, light-hearted. Focus on quirks, silly behavior |
| `PeacefulMoment` | Calm, serene, reflective. Focus on quiet beauty, contentment |
| `LossAndMemory` | Gentle, respectful, nostalgic. Focus on memories, tribute (handle sensitively) |
| `CareAndHealth` | Informative, caring, reassuring. Focus on health updates, recovery |
| `DailyLife` | Casual, relatable, everyday. Focus on routines, simple joys |

### 4. Content Guidelines

The AI-generated content should:

- Be written in **first person** (from the bird owner's perspective)
- Be **authentic** and **heartfelt**
- Be between **100-500 words** (comfortable reading length)
- **Not exceed 5000 characters** (story content limit)
- Include the **bird's name** naturally in the text
- Be appropriate for all ages
- Avoid promotional or commercial language
- Support the specified `language` parameter for localization

### 5. Rate Limiting

Implement rate limiting to prevent abuse:

- **Per user**: Maximum 10 generations per hour
- **Per bird**: Maximum 5 generations per hour per bird
- Consider implementing a daily limit (e.g., 30 per day)

### 6. AI Provider

Recommended options:
- **OpenAI GPT-4** with vision capabilities
- **Anthropic Claude** with vision capabilities
- **Google Gemini** with multimodal capabilities

The provider should support:
- Text generation
- Image understanding (for imageS3Key)
- Ideally video understanding (for videoS3Key), or fall back to frame extraction

---

## Sample AI Prompt Template

```
You are helping a bird owner write a heartfelt story about their beloved bird for a community platform called Wihngo.

BIRD INFORMATION:
- Name: {bird.name}
- Species: {bird.species} ({bird.scientificName})
- Age: {bird.age || "Unknown"}
- Location: {bird.location || "Unknown"}
- Description: {bird.description || bird.tagline}
- Is Memorial: {bird.isMemorial ? "Yes, this bird has passed away" : "No"}

{if imageAnalysis}
IMAGE CONTEXT:
{imageAnalysis}
{endif}

{if videoAnalysis}
VIDEO CONTEXT:
{videoAnalysis}
{endif}

STORY MOOD: {mode || "General/Daily Life"}
Mood guidelines: {moodGuidelines}

INSTRUCTIONS:
1. Write a story in first person from the owner's perspective
2. Make it authentic, heartfelt, and engaging
3. Naturally include the bird's name ({bird.name})
4. Match the tone to the selected mood
5. Keep it between 100-500 words
6. Make it feel like a real story shared by a bird lover
7. If this is a memorial bird, be respectful and focus on cherished memories
8. Write in {language}

Generate the story:
```

---

## Analytics & Tracking (Optional)

Consider tracking for future improvements:

```typescript
interface GenerationAnalytics {
  generationId: string;
  userId: string;
  birdId: string;
  mode?: StoryMode;
  hadImage: boolean;
  hadVideo: boolean;
  language: string;
  tokensUsed: number;
  generationTimeMs: number;
  wasUsed: boolean;        // If user actually posted the story
  wasEdited: boolean;      // If user edited before posting
  timestamp: Date;
}
```

---

## Frontend Integration Notes

The frontend will:
1. Require bird selection before AI generation is available
2. Pass the currently selected mood (if any)
3. Pass the uploaded image/video S3 key (if any)
4. Pass the user's current language preference
5. Display a loading state during generation
6. Show the generated content in the text input
7. Allow users to edit the generated content before posting

---

## Questions for Backend Team

1. **AI Provider**: Which AI provider/model should we use? (OpenAI, Anthropic, Google)
2. **Rate Limits**: Are the suggested rate limits (10/hour, 30/day) acceptable?
3. **Video Analysis**: Should we support video analysis or only images initially?
4. **Caching**: Should we cache bird context to reduce database calls?
5. **Cost Tracking**: Do we need to track AI costs per user/generation?
6. **Premium Feature**: Should this be a premium-only feature or available to all users?

---

## Timeline Suggestion

**Phase 1**: Basic text generation with bird profile context
**Phase 2**: Add image analysis capabilities
**Phase 3**: Add video analysis capabilities
**Phase 4**: Add multi-language support optimization

---

## Contact

For questions about this specification, please reach out to the frontend team.

Last updated: December 15, 2024
