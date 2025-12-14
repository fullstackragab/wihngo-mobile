import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StoryCardWithVideoProps {
  story: Story;
  onPress: (story: Story) => void;
  onLike: (storyId: string) => void;
  shouldPlay: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export default function StoryCardWithVideo({
  story,
  onPress,
  onLike,
  shouldPlay,
  onPlayingChange,
}: StoryCardWithVideoProps) {
  const [showImage, setShowImage] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoViewRef = useRef<VideoView>(null);

  const player = useVideoPlayer(story.videoUrl || "", (player) => {
    player.loop = false;
    player.muted = true; // Mute for autoplay in feed
    player.staysActiveInBackground = false;
  });

  // Handle play/pause based on visibility
  useEffect(() => {
    if (!story.videoUrl || !player) return;

    if (shouldPlay) {
      setShowImage(false);
      player.currentTime = 0;
      player.play();
    } else {
      player.pause();
      setShowImage(true);
    }
  }, [shouldPlay, story.videoUrl, player]);

  // Listen for video state changes
  useEffect(() => {
    if (!player) return;

    const playingSubscription = player.addListener("playingChange", (event) => {
      setIsPlaying(event.isPlaying);
      onPlayingChange?.(event.isPlaying);
    });

    const playToEndSubscription = player.addListener("playToEnd", () => {
      setShowImage(true);
    });

    return () => {
      playingSubscription.remove();
      playToEndSubscription.remove();
    };
  }, [player, onPlayingChange]);

  const handleImagePress = () => {
    if (story.videoUrl && player) {
      setShowImage(false);
      player.currentTime = 0;
      player.play();
    }
  };

  return (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => onPress(story)}
      activeOpacity={0.9}
    >
      {story.videoUrl ? (
        <View style={styles.videoContainer}>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={styles.storyMedia}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
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
              <View style={styles.playIcon}>
                <Ionicons name="play-circle" size={48} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      ) : story.imageUrl ? (
        <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
      ) : null}

      {/* Story Preview (truncated to 140 chars by backend) */}
      <Text style={styles.content} numberOfLines={3}>
        {story.preview}
      </Text>

      {/* Footer with birds and date */}
      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          {/* Tagged birds */}
          {story.birds && story.birds.length > 0 && (
            <View style={styles.birdsRow}>
              <FontAwesome6 name="tag" size={12} color="#999" />
              <Text style={styles.birdsText} numberOfLines={1}>
                {story.birds.join(", ")}
              </Text>
            </View>
          )}
          {/* Date */}
          <Text style={styles.dateText}>{story.date}</Text>
        </View>

        {/* Note: Likes and comments not yet implemented by backend */}
        {/* Placeholder for future implementation */}
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <FontAwesome6 name="heart" size={14} color="#DDD" />
          </View>
          <View style={styles.actionButton}>
            <FontAwesome6 name="comment" size={14} color="#DDD" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  storyCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: 180,
    marginBottom: Spacing.md,
  },
  storyImage: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F0F0F0",
    marginBottom: Spacing.md,
  },
  storyMedia: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F0F0F0",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: BorderRadius.sm,
  },
  playIcon: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 48,
  },
  title: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  content: {
    fontSize: Typography.body,
    color: "#666",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  metaInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  birdsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  birdsText: {
    fontSize: Typography.small,
    color: "#666",
    flex: 1,
  },
  dateText: {
    fontSize: Typography.small,
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.3,
  },
});
