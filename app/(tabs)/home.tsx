import { NotificationBell } from "@/components/notification-bell";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [featuredBirds, setFeaturedBirds] = useState<Bird[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [recentlySupported, setRecentlySupported] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"nearby" | "popular" | "new">("nearby");

  const loadHomeData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const featured = await birdService.getFeaturedBirds();
      // const trending = await storyService.getTrendingStories();
      // const supported = await birdService.getRecentlySupported();

      // Mock data for now
      setFeaturedBirds([]);
      setTrendingStories([]);
      setRecentlySupported([]);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const renderBirdCard = ({ item }: { item: Bird }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/(tabs)/birds/${item.birdId}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.imageOverlay}
      />
      <View style={styles.featuredInfo}>
        <Text style={styles.birdName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.birdSpecies} numberOfLines={1}>
          {item.species}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <FontAwesome6 name="heart" size={12} color="#FF6B6B" solid />
            <Text style={styles.statText}>{item.lovedBy}</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome6 name="hand-holding-heart" size={12} color="#4ECDC4" />
            <Text style={styles.statText}>{item.supportedBy}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStoryCard = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`/story/${item.storyId}`)}
      activeOpacity={0.7}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.storyImage} />
      )}
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.storyAuthor}>
          by {item.userName}
          {item.birdName && ` • ${item.birdName}`}
        </Text>
        <View style={styles.storyStats}>
          <View style={styles.stat}>
            <FontAwesome6 name="heart" size={12} color="#FF6B6B" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome6 name="comment" size={12} color="#95A5A6" />
            <Text style={styles.statText}>{item.commentsCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading amazing birds...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4ECDC4"]}
          tintColor="#4ECDC4"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Filter Buttons */}
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "nearby" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("nearby")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "nearby" && styles.filterButtonTextActive,
              ]}
            >
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "popular" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("popular")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "popular" && styles.filterButtonTextActive,
              ]}
            >
              Popular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "new" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("new")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "new" && styles.filterButtonTextActive,
              ]}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <NotificationBell iconSize={22} iconColor="#666" />
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={styles.searchButton}
          >
            <FontAwesome6 name="magnifying-glass" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Birds - Primary Focus */}
      <View style={styles.section}>
        {featuredBirds.length > 0 ? (
          <FlatList
            horizontal
            data={featuredBirds}
            renderItem={renderBirdCard}
            keyExtractor={(item) => item.birdId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome6 name="dove" size={40} color="#E0E0E0" />
            <Text style={styles.emptyText}>No birds yet</Text>
            <TouchableOpacity
              style={styles.textButton}
              onPress={() => router.push("/(tabs)/birds")}
            >
              <Text style={styles.textButtonLabel}>Explore Birds</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stories Section - Compact */}
      {trendingStories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/stories")}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {trendingStories.map((story) => (
            <View key={story.storyId}>{renderStoryCard({ item: story })}</View>
          ))}
        </View>
      )}

      {/* Recently Supported - Only show if authenticated and has data */}
      {isAuthenticated && recentlySupported.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your birds</Text>
          <FlatList
            horizontal
            data={recentlySupported}
            renderItem={renderBirdCard}
            keyExtractor={(item) => item.birdId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: "#999",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F5F5F5",
  },
  filterButtonActive: {
    backgroundColor: "#1A1A1A",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    backgroundColor: "#F5F5F5",
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h2,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: Typography.small,
    color: "#666",
    fontWeight: "500",
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  featuredCard: {
    width: 160,
    marginRight: Spacing.md,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    borderRadius: BorderRadius.md,
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  birdName: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  birdSpecies: {
    fontSize: Typography.small,
    color: "rgba(255,255,255,0.9)",
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: Typography.small,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  storyCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  storyImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F0F0F0",
  },
  storyContent: {
    padding: Spacing.md,
  },
  storyTitle: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  storyAuthor: {
    fontSize: Typography.small,
    color: "#999",
    marginBottom: Spacing.sm,
  },
  storyStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.body,
    color: "#999",
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  textButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  textButtonLabel: {
    color: "#4ECDC4",
    fontSize: Typography.body,
    fontWeight: "500",
  },
});
