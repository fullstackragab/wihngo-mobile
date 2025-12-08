export type Story = {
  storyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  birdId?: string;
  birdName?: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
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
  imageUrl?: string;
  videoUrl?: string;
};

export type StoryDetailDto = Story & {
  comments: StoryComment[];
};
