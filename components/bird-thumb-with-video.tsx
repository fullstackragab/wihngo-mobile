import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Bird } from "@/types/bird";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BirdThumbWithVideoProps {
  bird: Bird;
  onPress: (bird: Bird) => void;
  shouldPlay: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2; // 2 columns with spacing

export default function BirdThumbWithVideo({
  bird,
  onPress,
  shouldPlay,
  onPlayingChange,
}: BirdThumbWithVideoProps) {
  const [showImage, setShowImage] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoViewRef = useRef<VideoView>(null);

  const player = useVideoPlayer(bird.videoUrl || "", (player) => {
    player.loop = false;
    player.muted = true; // Mute for autoplay in feed
  });

  // Handle play/pause based on visibility
  useEffect(() => {
    if (!bird.videoUrl || !player) return;

    if (shouldPlay) {
      setShowImage(false);
      setTimeout(() => {
        player.currentTime = 0;
        player.play();
      }, 100);
    } else {
      player.pause();
      setShowImage(true);
    }
  }, [shouldPlay, bird.videoUrl, player]);

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
    if (bird.videoUrl && player) {
      setShowImage(false);
      setTimeout(() => {
        player.currentTime = 0;
        player.play();
      }, 100);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(bird)}
      activeOpacity={0.7}
    >
      {bird.videoUrl ? (
        <View style={styles.videoContainer}>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />
          {showImage && (
            <TouchableOpacity
              onPress={handleImagePress}
              activeOpacity={0.9}
              style={styles.imageOverlay}
            >
              <Image
                source={bird.imageUrl || "https://via.placeholder.com/150"}
                style={styles.video}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Image
          source={bird.imageUrl || "https://via.placeholder.com/150"}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {bird.name}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.stats}>❤️ {bird.lovedBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.1,
    backgroundColor: "#F0F0F0",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: CARD_WIDTH * 1.1,
  },
  video: {
    width: "100%",
    height: CARD_WIDTH * 1.1,
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
  },
  playIcon: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 40,
  },
  info: {
    padding: Spacing.sm,
  },
  name: {
    fontWeight: "500",
    fontSize: Typography.small,
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
  },
  stats: {
    fontSize: Typography.tiny,
    color: "#999",
  },
});
