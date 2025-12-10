import LoveThisBirdButton from "@/components/love-this-bird-button";
import ShareButton from "@/components/share-button";
import SupportButton from "@/components/support-button";
import ErrorView from "@/components/ui/error-view";
import LoadingScreen from "@/components/ui/loading-screen";
import { getBirdByIdService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function BirdDetails() {
  const [bird, setBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loveCount, setLoveCount] = useState(0);
  const { id } = useLocalSearchParams<{ id: string }>();

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
        <Image
          source={{ uri: bird.imageUrl || "https://via.placeholder.com/400" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.statsContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
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
              alignItems: "center",
              justifyContent: "flex-end",
              paddingHorizontal: 20,
            }}
          >
            <ShareButton
              variant="icon"
              title={`${bird.name} - ${bird.species}`}
              message={`Check out this amazing bird: ${bird.name} (${bird.species})!\n\n"${bird.tagline}"\n\n❤️ ${loveCount} loved | 🐦 ${bird.supportedBy} supported`}
              iconSize={24}
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
  content: {
    padding: 22,
    paddingTop: 0,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    paddingTop: 0,
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
  },
  statCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
    minWidth: 50,
    paddingTop: 0,
  },
  statHeart: {
    fontSize: 17,
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
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
