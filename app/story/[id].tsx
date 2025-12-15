import { MoodBadge } from "@/components/MoodBadge";
import ShareButton from "@/components/share-button";
import { storyService } from "@/services/story.service";
import { StoryComment, StoryDetailDto } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function StoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<StoryDetailDto | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoViewRef = useRef<VideoView>(null);

  const player = useVideoPlayer(story?.videoUrl || "", (player) => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    if (id) {
      loadStoryDetail();
    }
  }, [id]);

  // Ensure portrait orientation when component mounts
  useEffect(() => {
    const setPortraitOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
    setPortraitOrientation();
  }, []);

  // Show image for 1 second then play video (only if video exists)
  useEffect(() => {
    if (story?.videoUrl && player) {
      setShowImage(true);
      const timer = setTimeout(() => {
        setShowImage(false);
        // Play video after image is hidden
        player.play();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [story, player]);

  // Listen for video end to show image again
  useEffect(() => {
    if (!player) return;

    const playingSubscription = player.addListener("playingChange", (event) => {
      setIsPlaying(event.isPlaying);
    });

    const playToEndSubscription = player.addListener("playToEnd", () => {
      // When video finishes playing, show image
      setShowImage(true);
    });

    return () => {
      playingSubscription.remove();
      playToEndSubscription.remove();
    };
  }, [player]);

  const loadStoryDetail = async () => {
    if (!id) return;

    try {
      const data = await storyService.getStoryDetail(id);
      setStory(data);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error loading story:", error);
      Alert.alert("Error", "Failed to load story details");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    // Like functionality not yet implemented by backend
    Alert.alert(
      "Coming Soon",
      "Like functionality will be available in a future update."
    );
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleFullscreen = async () => {
    try {
      // Change to landscape orientation before entering fullscreen
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      await videoViewRef.current?.enterFullscreen();
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

  const handleFullscreenExit = async () => {
    try {
      // First unlock orientation to allow rotation
      await ScreenOrientation.unlockAsync();
      // Then explicitly set to portrait and lock
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } catch (error) {
      console.error("Error setting portrait orientation:", error);
    }
  };

  const handleImagePress = () => {
    if (story?.videoUrl && player) {
      setShowImage(false);
      // Reset player position to beginning and play after component mounts
      setTimeout(() => {
        player.currentTime = 0;
        player.play();
      }, 150);
    }
  };

  const handleSubmitComment = async () => {
    // Comment functionality not yet implemented by backend
    Alert.alert(
      "Coming Soon",
      "Comment functionality will be available in a future update."
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t("story.notFound")}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t("story.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.content}>
        {/* Author Info */}
        <View style={styles.authorSection}>
          <View style={styles.avatar}>
            <FontAwesome6 name="user" size={24} color="#95A5A6" />
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{story.author.name}</Text>
            <Text style={styles.timestamp}>
              {new Date(story.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Tagged Birds */}
        {story.birds && story.birds.length > 0 && (
          <View style={styles.birdsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.birdsScrollContent}
            >
              {story.birds.map((bird) => (
                <TouchableOpacity
                  key={bird.birdId}
                  style={styles.birdCard}
                  onPress={() => router.push(`/bird/${bird.birdId}`)}
                >
                  {bird.imageUrl ? (
                    <Image
                      source={{ uri: bird.imageUrl }}
                      style={styles.birdAvatar}
                    />
                  ) : (
                    <View style={styles.birdAvatar}>
                      <FontAwesome6 name="dove" size={16} color="#4ECDC4" />
                    </View>
                  )}
                  <View style={styles.birdCardInfo}>
                    <Text style={styles.birdCardName}>{bird.name}</Text>
                    {bird.species && (
                      <Text style={styles.birdCardSpecies}>{bird.species}</Text>
                    )}
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={12}
                    color="#95A5A6"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mood Badge (if present) */}
        {story.mode && (
          <View style={styles.moodSection}>
            <MoodBadge mode={story.mode} size="medium" />
          </View>
        )}

        {/* Story Content */}
        <Text style={styles.contentText}>{story.content}</Text>

        {/* Media: Video first if available, otherwise image */}
        {story.videoUrl ? (
          <View style={styles.videoContainer}>
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.storyMedia}
              contentFit="cover"
              allowsFullscreen
              allowsPictureInPicture={false}
              nativeControls={false}
              onFullscreenExit={handleFullscreenExit}
            />
            {showImage && story.imageUrl && (
              <TouchableOpacity
                onPress={handleImagePress}
                activeOpacity={0.9}
                style={styles.imageOverlay}
              >
                <Image
                  source={{ uri: story.imageUrl }}
                  style={styles.storyMedia}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {!showImage && (
              <View style={styles.customControls}>
                <TouchableOpacity
                  onPress={handlePlayPause}
                  style={styles.controlButton}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFullscreen}
                  style={styles.controlButton}
                >
                  <Ionicons name="expand" size={18} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : story.imageUrl ? (
          <Image source={{ uri: story.imageUrl }} style={styles.storyMedia} />
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <FontAwesome6 name="heart" size={24} color="#95A5A6" />
            <Text style={styles.actionText}>{t("story.like")}</Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <FontAwesome6 name="comment" size={24} color="#95A5A6" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </View>

          <ShareButton
            title={`Check out this story by ${story.author.name}!`}
            message={story.content.substring(0, 100) + "..."}
            variant="icon"
            iconSize={24}
            iconColor="#95A5A6"
            style={styles.actionButton}
          />
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            {t("story.commentsCount", { count: comments.length })}
          </Text>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.commentId} style={styles.commentCard}>
                <View style={styles.commentAvatar}>
                  {comment.userAvatar ? (
                    <Image
                      source={{ uri: comment.userAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <FontAwesome6 name="user" size={16} color="#95A5A6" />
                  )}
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder={t("story.writeComment")}
          placeholderTextColor="#95A5A6"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submittingComment}
        >
          <FontAwesome6
            name="paper-plane"
            size={20}
            color={commentText.trim() ? "#4ECDC4" : "#BDC3C7"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  content: {
    flex: 1,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  timestamp: {
    fontSize: 11,
    color: "#95A5A6",
    marginTop: 2,
  },
  birdsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  birdsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  birdCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    minWidth: 200,
  },
  birdAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  birdCardInfo: {
    flex: 1,
  },
  birdCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  birdCardSpecies: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  moodSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contentText: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  videoContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    marginBottom: 20,
  },
  storyMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "#E8E8E8",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  customControls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    zIndex: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "600",
  },
  actionTextActive: {
    color: "#FF6B6B",
  },
  commentsSection: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
  },
  commentTime: {
    fontSize: 10,
    color: "#95A5A6",
  },
  commentText: {
    fontSize: 13,
    color: "#5D6D7E",
    lineHeight: 18,
  },
  noComments: {
    fontSize: 13,
    color: "#95A5A6",
    textAlign: "center",
    paddingVertical: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: "#2C3E50",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 14,
    color: "#95A5A6",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
