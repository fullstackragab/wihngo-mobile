export type Notification = {
  notificationId: string;
  userId: string;
  type: "support" | "love" | "comment" | "story" | "recommendation";
  title: string;
  message: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // Bird ID, Story ID, etc.
};

export type NotificationPreferences = {
  supportNotifications: boolean;
  loveNotifications: boolean;
  commentNotifications: boolean;
  storyNotifications: boolean;
  recommendationNotifications: boolean;
  emailNotifications: boolean;
};
