import LoveThisBirdButton from "@/components/love-this-bird-button";
import ShareButton from "@/components/share-button";
import SupportButton from "@/components/support-button";
import ErrorView from "@/components/ui/error-view";
import LoadingScreen from "@/components/ui/loading-screen";
import { getBirdByIdService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function BirdDetails() {
  const [bird, setBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loveCount, setLoveCount] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoViewRef = useRef<VideoView>(null);

  const player = useVideoPlayer(bird?.videoUrl || "", (player) => {
    player.loop = false;
    player.muted = false;
  });

  const loadBirdDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getBirdByIdService(id as string);
      console.log(
        "Bird data loaded - FULL OBJECT:",
        JSON.stringify(data, null, 2)
      );
      console.log("Bird name:", data.name);
      console.log("Bird species:", data.species);
      setBird(data);
      setLoveCount(data.lovedBy || 0);
    } catch (err) {
      setError("Failed to load bird details. Please try again.");
      console.error("Error loading bird details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBirdDetails();
  }, [loadBirdDetails]);

  // Ensure portrait orientation when component mounts
  useEffect(() => {
    const setPortraitOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
    setPortraitOrientation();
  }, []);

  // Show image for 1 second then play video
  useEffect(() => {
    if (bird?.videoUrl && player) {
      setShowImage(true);
      const timer = setTimeout(() => {
        setShowImage(false);
        // Play video after image is hidden
        player.play();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [bird, player]);

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
    if (bird?.videoUrl && player) {
      setShowImage(false);
      // Reset player position to beginning and play after component mounts
      setTimeout(() => {
        player.currentTime = 0;
        player.play();
      }, 150);
    }
  };

  const handleLoveChange = (isLoved: boolean, newCount: number) => {
    setLoveCount(newCount);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Bird Details" }} />
        <LoadingScreen message="Loading bird details..." />
      </>
    );
  }

  if (error || !bird) {
    return (
      <>
        <Stack.Screen options={{ title: "Bird Details" }} />
        <ErrorView
          message={error || "Bird not found"}
          onRetry={loadBirdDetails}
          retryButtonText="Reload"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Bird Details`, headerShown: false }} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {bird.videoUrl ? (
          <View style={styles.videoContainer}>
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.heroImage}
              contentFit="cover"
              allowsFullscreen
              allowsPictureInPicture={false}
              nativeControls={false}
              onFullscreenExit={handleFullscreenExit}
            />
            {showImage && (
              <TouchableOpacity
                onPress={handleImagePress}
                activeOpacity={0.9}
                style={styles.imageOverlay}
              >
                <Image
                  source={{
                    uri: bird.imageUrl || "https://via.placeholder.com/400",
                  }}
                  style={styles.heroImage}
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
        ) : (
          <Image
            source={{ uri: bird.imageUrl || "https://via.placeholder.com/400" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.statsContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 6,
            }}
          >
            <View style={styles.statCard}>
              <Text style={styles.statHeart}>❤️</Text>
              <Text style={styles.statNumber}>{loveCount}</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="corn" size={20} color="#10b981" />
              <Text style={styles.statNumber}>{bird.supportedBy}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              paddingHorizontal: 20,
              marginTop: -10,
              paddingTop: 0,
            }}
          >
            <ShareButton
              variant="icon"
              title={`${bird.name} - ${bird.species}`}
              message={`Check out this amazing bird: ${bird.name} (${bird.species})!\n\n"${bird.tagline}"\n\n❤️ ${loveCount} loved | 🐦 ${bird.supportedBy} supported`}
              iconSize={24}
              style={{ marginTop: 0, paddingTop: 0 }}
            />
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{bird.name}</Text>
            <Text style={styles.species}>{bird.species}</Text>
          </View>

          {bird.tagline && (
            <View style={styles.section}>
              <Text style={styles.tagline}>{bird.tagline}</Text>
            </View>
          )}
          <View style={styles.buttonsContainer}>
            <LoveThisBirdButton
              birdId={bird.birdId}
              initialIsLoved={bird.isLoved || false}
              initialLoveCount={loveCount}
              onLoveChange={handleLoveChange}
              variant="gradient"
            />

            <SupportButton
              birdId={bird.birdId}
              birdName={bird.name}
              isMemorial={bird.isMemorial}
              variant="gradient"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingBottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderWidth: 20,
    borderRadius: 50,
    borderColor: "white",
    paddingBottom: 0,
  },
  videoContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
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
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 22,
    paddingTop: 0,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    paddingTop: 0,
    marginTop: 0,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  species: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  tagline: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 0,
    top: -10,
  },
  statCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 20,
    minWidth: 50,
    paddingTop: 0,
  },
  statHeart: {
    fontSize: 16,
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    marginLeft: 8,
  },
  shareText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    justifyContent: "center",
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 16,
  },
  gradientButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  outlineButtonWrapper: {
    flex: 1,
    borderRadius: 16,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#10b981",
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
