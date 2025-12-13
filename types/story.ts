export type Story = {
  storyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  birdId?: string;
  birdName?: string;
  title: string;
  content: string;
  imageUrl?: string; // Pre-signed URL from API
  imageS3Key?: string; // S3 storage key
  videoUrl?: string; // Pre-signed URL from API
  videoS3Key?: string; // S3 storage key
  likes: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
  isHighlighted?: boolean;
  highlightOrder?: number;
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

export type CreateStoryDto = {
  title: string;
  content: string;
  birdId?: string;
  imageS3Key?: string;
  videoS3Key?: string;
};

export type StoryDetailDto = Story & {
  comments: StoryComment[];
};
