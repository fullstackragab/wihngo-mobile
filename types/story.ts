// Story Mood enum matching API specification
export enum StoryMode {
  LoveAndBond = "LoveAndBond",
  NewBeginning = "NewBeginning",
  ProgressAndWins = "ProgressAndWins",
  FunnyMoment = "FunnyMoment",
  PeacefulMoment = "PeacefulMoment",
  LossAndMemory = "LossAndMemory",
  CareAndHealth = "CareAndHealth",
  DailyLife = "DailyLife",
}

// Story Mood metadata for UI display
export const STORY_MOODS = [
  {
    value: StoryMode.LoveAndBond,
    label: "Love & Bond",
    emoji: "💕",
    description: "Affection, trust, cuddles, attachment",
    example: '"She finally slept on my shoulder…"',
  },
  {
    value: StoryMode.NewBeginning,
    label: "New Beginning",
    emoji: "🐣",
    description: "New bird, adoption, rescue, first day",
    example: '"Welcome home, Sky 💚"',
  },
  {
    value: StoryMode.ProgressAndWins,
    label: "Progress & Wins",
    emoji: "🎉",
    description: "Training success, health improvement, milestones",
    example: '"He learned to say his name today!"',
  },
  {
    value: StoryMode.FunnyMoment,
    label: "Funny Moment",
    emoji: "😄",
    description: "Silly behavior, unexpected actions",
    example: '"He stole my keys again…"',
  },
  {
    value: StoryMode.PeacefulMoment,
    label: "Peaceful Moment",
    emoji: "🕊️",
    description: "Calm, beautiful, emotional silence",
    example: '"Just watching him enjoy the sun…"',
  },
  {
    value: StoryMode.LossAndMemory,
    label: "Loss & Memory",
    emoji: "😢",
    description: "Passing away, remembrance, grief",
    example: '"You\'ll always be with me…"',
  },
  {
    value: StoryMode.CareAndHealth,
    label: "Care & Health",
    emoji: "🩺",
    description: "Vet visits, recovery, advice, awareness",
    example: '"Post-surgery update…"',
  },
  {
    value: StoryMode.DailyLife,
    label: "Daily Life",
    emoji: "🌿",
    description: "Normal routines, everyday moments",
    example: '"Our usual morning together"',
  },
] as const;

// Bird info in story (updated structure)
export type StoryBird = {
  birdId: string;
  name: string;
  species?: string;
  imageS3Key?: string;
  imageUrl?: string;
  videoS3Key?: string;
  videoUrl?: string;
  tagline?: string;
  lovedBy?: number;
  supportedBy?: number;
  ownerId?: string;
};

// Story list item (from GET /api/stories)
export type Story = {
  storyId: string;
  birds: string[]; // Array of bird names for list view
  mode?: StoryMode | null; // Optional mood
  date: string; // Formatted date string (e.g., "December 25, 2024")
  preview: string; // Content preview (truncated to 140 chars)
  imageS3Key?: string | null;
  imageUrl?: string | null;
  videoS3Key?: string | null;
  videoUrl?: string | null;
  audioS3Key?: string | null;
  audioUrl?: string | null;
  likeCount?: number; // Number of likes on the story
  commentCount?: number; // Number of top-level comments
};

export type StoryComment = {
  commentId: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
};

// Request payload for creating a story
export type CreateStoryDto = {
  content: string; // REQUIRED: Story content (max 5000 chars, cannot be empty)
  birdId: string; // REQUIRED: Single bird ID
  mode?: StoryMode | null; // OPTIONAL: Story mood
  imageS3Key?: string | null; // OPTIONAL: S3 key from media upload
  videoS3Key?: string | null; // OPTIONAL: S3 key from media upload
  audioS3Key?: string | null; // OPTIONAL: S3 key from audio recording (can be combined with image/video)
};

// Request payload for updating a story (all fields optional for partial updates)
export type UpdateStoryDto = {
  content?: string; // Optional: Updated content (cannot be empty if provided)
  imageS3Key?: string | null; // Optional: new image key or "" to remove (auto-removes video)
  videoS3Key?: string | null; // Optional: new video key or "" to remove (auto-removes image)
  mode?: StoryMode | null; // Optional: new mood or null to remove
  birdIds?: string[]; // Optional: Must have at least 1 if provided
};

// Full story detail (from GET /api/stories/{id})
export type StoryDetailDto = {
  storyId: string;
  content: string; // Full content
  mode?: StoryMode | null;
  imageS3Key?: string | null;
  imageUrl?: string | null;
  videoS3Key?: string | null;
  videoUrl?: string | null;
  audioS3Key?: string | null;
  audioUrl?: string | null;
  createdAt: string; // ISO 8601 format
  birds: StoryBird[]; // Full bird details with pre-signed URLs
  author: {
    userId: string;
    name: string; // Author name (no avatar available yet)
  };
  likeCount?: number; // Number of likes on the story
  commentCount?: number; // Number of top-level comments
};

// Paginated response
export type StoryListResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Story[];
};

// Story length options for AI generation
export enum StoryLength {
  Short = "Short",
  Medium = "Medium",
}

// Request payload for AI story generation
export type GenerateStoryRequest = {
  birdId: string; // REQUIRED: The bird to generate a story about
  mode?: StoryMode | null; // OPTIONAL: The mood/tone of the story
  imageS3Key?: string | null; // OPTIONAL: S3 key of uploaded image for context
  videoS3Key?: string | null; // OPTIONAL: S3 key of uploaded video for context
  language?: string; // OPTIONAL: Language code (e.g., "en", "es"). Default: "en"
  length?: StoryLength | null; // OPTIONAL: Story length (Short/Medium/Long). Default: Medium
};

// Response from AI story generation
export type GenerateStoryResponse = {
  generatedContent: string; // The AI-generated story content (max 5000 chars)
  tokensUsed?: number; // OPTIONAL: Number of AI tokens consumed
  generationId?: string; // OPTIONAL: Unique ID for tracking/analytics
};
