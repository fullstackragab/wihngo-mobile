import LoveThisBirdButton from "@/components/love-this-bird-button";
import { PremiumBadge } from "@/components/premium-badge";
import SupportButton from "@/components/support-button";
import AnimatedCard from "@/components/ui/animated-card";
import { useAuth } from "@/contexts/auth-context";
import { hasPremium } from "@/services/premium.service";
import { Bird, BirdHealthLog } from "@/types/bird";
import { Story } from "@/types/story";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BirdProfileProps {
  bird?: Bird;
}

export default function BirdProfile({ bird }: BirdProfileProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loveCount, setLoveCount] = useState(bird?.lovedBy || 2847);
  const [stories, setStories] = useState<Story[]>([]);
  const [healthLogs, setHealthLogs] = useState<BirdHealthLog[]>([]);
  const [showAllStories, setShowAllStories] = useState(false);

  const isPremiumBird = hasPremium(bird || {});
  const isOwner = user?.userId === bird?.ownerId;

  const handlePremiumUpgrade = () => {
    // Navigate to subscription flow or open payment modal
    Alert.alert(
      "Upgrade to Premium",
      "This will redirect you to the subscription page.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => console.log("Navigate to payment") },
      ]
    );
  };

  const handlePremiumUpdate = () => {
    // Refresh bird data after premium status change
    console.log("Premium status updated, refresh bird data");
  };

  const handleLoveChange = (isLoved: boolean, newCount: number) => {
    setLoveCount(newCount);
  };

  const displayedStories = showAllStories ? stories : stories.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <AnimatedCard>
        {/* Cover Image */}
        <LinearGradient
          colors={
            bird?.isMemorial ? ["#95A5A6", "#7F8C8D"] : ["#fbc2eb", "#a6c1ee"]
          }
          style={styles.hero}
        >
          <Image
            source={{
              uri:
                bird?.coverImageUrl ||
                bird?.imageUrl ||
                "https://via.placeholder.com/200",
            }}
            style={styles.heroImage}
          />
          {bird?.isMemorial && (
            <View style={styles.memorialBadge}>
              <FontAwesome6 name="heart" size={12} color="#fff" />
              <Text style={styles.memorialBadgeText}>In Loving Memory</Text>
            </View>
          )}
        </LinearGradient>

        {/* Bird Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {bird?.name || "Anna's Hummingbird"}
            </Text>
            {isPremiumBird && <PremiumBadge size="medium" />}
          </View>
          <Text style={styles.subtitle}>
            {bird?.scientificName || "Calypte anna"}
          </Text>
          {bird?.species && (
            <View style={styles.speciesTag}>
              <FontAwesome6 name="dove" size={14} color="#4ECDC4" />
              <Text style={styles.speciesText}>{bird.species}</Text>
            </View>
          )}
          <Text style={styles.highlight}>
            {bird?.tagline || "A tiny jewel that brings wonder year-round"}
          </Text>
          <Text style={styles.description}>
            {bird?.description ||
              "Named after Anna Masséna, Duchess of Rivoli, this remarkable hummingbird is known for its iridescent rose-pink crown and throat. Unlike most hummingbirds, Anna's are year-round residents along the Pacific Coast."}
          </Text>

          {/* Additional Info */}
          <View style={styles.infoGrid}>
            {bird?.age && (
              <View style={styles.infoItem}>
                <FontAwesome6 name="calendar" size={14} color="#7F8C8D" />
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{bird.age}</Text>
              </View>
            )}
            {bird?.location && (
              <View style={styles.infoItem}>
                <FontAwesome6 name="location-dot" size={14} color="#7F8C8D" />
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{bird.location}</Text>
              </View>
            )}
            {bird?.ownerName && (
              <View style={styles.infoItem}>
                <FontAwesome6 name="user" size={14} color="#7F8C8D" />
                <Text style={styles.infoLabel}>Owner:</Text>
                <Text style={styles.infoValue}>{bird.ownerName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: "#fee2e2" }]}>
            <Ionicons name="heart" size={18} color="#ef4444" />
            <Text style={styles.statValue}>{loveCount}</Text>
            <Text style={styles.statLabel}>Loves</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: "#dcfce7" }]}>
            <Ionicons name="sparkles" size={18} color="#10b981" />
            <Text style={styles.statValue}>{bird?.supportedBy || 423}</Text>
            <Text style={styles.statLabel}>Supporters</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.content}>
          <View style={styles.actions}>
            {bird?.birdId && (
              <LoveThisBirdButton
                birdId={bird.birdId}
                initialIsLoved={bird.isLoved || false}
                initialLoveCount={loveCount}
                onLoveChange={handleLoveChange}
                variant="pill"
                style={{ flex: 1 }}
              />
            )}
            {!bird?.isMemorial && (
              <TouchableOpacity
                style={styles.supportButton}
                onPress={handleSupport}
                initialIsLoved={bird.isLoved || false}
                initialLoveCount={loveCount}
                onLoveChange={handleLoveChange}
                variant="pill"
                style={{ flex: 1 }}
              />
            )}
            {!bird?.isMemorial && (
              <SupportButton
                birdId={bird?.birdId}
                birdName={bird?.name}
                isMemorial={bird?.isMemorial}
                variant="solid"
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>   ownerId={bird?.ownerId || ""}
                  onStatusChange={handlePremiumUpdate}
                />
                <PremiumFrameSelector
                  birdId={bird?.birdId || ""}
                  currentFrameId={bird?.premiumStyle?.frameId}
                  onFrameUpdate={handlePremiumUpdate}
                />
                <StoryHighlights
                  birdId={bird?.birdId || ""}
                  stories={stories}
                  onUpdate={handlePremiumUpdate}
                />
              </>
            )}
          </View>
        )}

        {/* Support Transparency */}
        {!bird?.isMemorial && bird?.totalSupport && bird.totalSupport > 0 && (
          <View style={styles.transparencySection}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="chart-pie" size={16} color="#2C3E50" />
              <Text style={styles.sectionTitle}>Support Transparency</Text>
            </View>
            <View style={styles.transparencyCard}>
              <Text style={styles.transparencyAmount}>
                ${bird.totalSupport.toLocaleString()} raised
              </Text>
              <Text style={styles.transparencyText}>
                Funds used for: Food, medicine, vet visits, and habitat
                maintenance
              </Text>
              <TouchableOpacity
                style={styles.transparencyLink}
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Detailed breakdown will be available soon"
                  )
                }
              >
                <Text style={styles.transparencyLinkText}>View Details</Text>
                <FontAwesome6 name="arrow-right" size={12} color="#4ECDC4" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Health Log (for owners) */}
        {healthLogs.length > 0 && (
          <View style={styles.healthSection}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="notes-medical" size={16} color="#2C3E50" />
              <Text style={styles.sectionTitle}>Health Updates</Text>
            </View>
            {healthLogs.slice(0, 3).map((log) => (
              <View key={log.logId} style={styles.healthLogCard}>
                <View style={styles.healthLogHeader}>
                  <Text style={styles.healthLogTitle}>{log.title}</Text>
                  <Text style={styles.healthLogDate}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.healthLogDescription}>
                  {log.description}
                </Text>
                {log.cost && (
                  <Text style={styles.healthLogCost}>${log.cost}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Bird Stories */}
        <View style={styles.storiesSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="book-open" size={16} color="#2C3E50" />
            <Text style={styles.sectionTitle}>Stories</Text>
          </View>
          {stories.length > 0 ? (
            <>
              {displayedStories.map((story) => (
                <TouchableOpacity
                  key={story.storyId}
                  style={styles.storyCard}
                  onPress={() => router.push(`/story/${story.storyId}`)}
                >
                  {story.imageUrl && (
                    <Image
                      source={{ uri: story.imageUrl }}
                      style={styles.storyThumb}
                    />
                  )}
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                    <Text style={styles.storyAuthor}>by {story.userName}</Text>
                    <View style={styles.storyStats}>
                      <View style={styles.storyStat}>
                        <FontAwesome6 name="heart" size={12} color="#FF6B6B" />
                        <Text style={styles.storyStatText}>{story.likes}</Text>
                      </View>
                      <View style={styles.storyStat}>
                        <FontAwesome6
                          name="comment"
                          size={12}
                          color="#95A5A6"
                        />
                        <Text style={styles.storyStatText}>
                          {story.commentsCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {stories.length > 3 && !showAllStories && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllStories(true)}
                >
                  <Text style={styles.showMoreText}>
                    Show all {stories.length} stories
                  </Text>
                  <FontAwesome6 name="chevron-down" size={12} color="#4ECDC4" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyStories}>
              <FontAwesome6 name="book-open" size={32} color="#BDC3C7" />
              <Text style={styles.emptyStoriesText}>No stories yet</Text>
              <TouchableOpacity
                style={styles.createStoryButton}
                onPress={() => router.push("/create-story")}
              >
                <FontAwesome6 name="plus" size={14} color="#fff" />
                <Text style={styles.createStoryButtonText}>Share a Story</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  hero: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  memorialBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memorialBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#7F8C8D",
    marginBottom: 12,
  },
  speciesTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F8F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  speciesText: {
    fontSize: 10,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  highlight: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: "#5D6D7E",
    lineHeight: 20,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 12,
    color: "#2C3E50",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 6,
  },
  statValue: {
    fontWeight: "700",
    fontSize: 14,
    color: "#2C3E50",
  },
  statLabel: {
    fontSize: 11,
    color: "#7F8C8D",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  loveButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loveButtonActive: {
    backgroundColor: "#E74C3C",
  },
  supportButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  transparencySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  transparencyCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  transparencyAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 8,
  },
  transparencyText: {
    fontSize: 12,
    color: "#5D6D7E",
    lineHeight: 18,
    marginBottom: 12,
  },
  transparencyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transparencyLinkText: {
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  healthSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  healthLogCard: {
    backgroundColor: "#FFF9F0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  healthLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  healthLogTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  healthLogDate: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  healthLogDescription: {
    fontSize: 12,
    color: "#5D6D7E",
    lineHeight: 18,
    marginBottom: 8,
  },
  healthLogCost: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F39C12",
  },
  storiesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storyCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  storyThumb: {
    width: 80,
    height: 80,
    backgroundColor: "#E8E8E8",
  },
  storyContent: {
    flex: 1,
    padding: 12,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  storyStats: {
    flexDirection: "row",
    gap: 12,
  },
  storyStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storyStatText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  emptyStories: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStoriesText: {
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 12,
    marginBottom: 16,
  },
  createStoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createStoryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
