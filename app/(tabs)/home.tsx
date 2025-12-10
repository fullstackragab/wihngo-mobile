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
      {/* Header */}
      <LinearGradient
        colors={["#4ECDC4", "#44A08D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.greeting}>
            {isAuthenticated ? `Hello, ${user?.name}!` : "Welcome!"}
          </Text>
          <Text style={styles.subtitle}>Discover amazing birds today</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/search")}
          style={styles.searchButton}
        >
          <FontAwesome6 name="magnifying-glass" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/(tabs)/birds")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#FFE5E5" }]}>
              <FontAwesome6 name="dove" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.quickActionText}>Explore Birds</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/(tabs)/stories")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#E0E7FF" }]}>
              <FontAwesome6 name="book-open" size={24} color="#667EEA" />
            </View>
            <Text style={styles.quickActionText}>Read Stories</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/add-bird")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#D4F4DD" }]}>
              <FontAwesome6 name="plus" size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>Add Bird</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/create-story")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#FFF4E5" }]}>
              <FontAwesome6 name="pen" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>Create Story</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Birds */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Birds</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/birds")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
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
            <View style={styles.emptyIconContainer}>
              <FontAwesome6 name="dove" size={48} color="#4ECDC4" />
            </View>
            <Text style={styles.emptyTitle}>No featured birds yet</Text>
            <Text style={styles.emptyText}>
              Be the first to explore our bird collection
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/birds")}
            >
              <Text style={styles.exploreButtonText}>Explore Birds</Text>
              <FontAwesome6 name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Trending Stories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Stories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/stories")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        {trendingStories.length > 0 ? (
          <View>
            {trendingStories.map((story) => (
              <View key={story.storyId}>
                {renderStoryCard({ item: story })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome6 name="book-open" size={48} color="#667EEA" />
            </View>
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptyText}>
              Share your bird experiences and inspire others
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/create-story")}
            >
              <Text style={styles.exploreButtonText}>Create Story</Text>
              <FontAwesome6 name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recently Supported - Only show if authenticated */}
      {isAuthenticated && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Supported Birds</Text>
          </View>
          {recentlySupported.length > 0 ? (
            <FlatList
              horizontal
              data={recentlySupported}
              renderItem={renderBirdCard}
              keyExtractor={(item) => item.birdId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FontAwesome6 name="hand-holding-heart" size={48} color="#10b981" />
              </View>
              <Text style={styles.emptyTitle}>Support your first bird</Text>
              <Text style={styles.emptyText}>
                Help protect and conserve endangered species
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Impact Banner */}
      <View style={styles.bannerSection}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <FontAwesome6 name="heart" size={32} color="#FFD93D" solid />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Make an Impact</Text>
            <Text style={styles.bannerText}>
              Join our community in protecting endangered birds worldwide
            </Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 15,
    color: "#E0F2F1",
    marginTop: 4,
  },
  searchButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 12,
    borderRadius: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  seeAll: {
    fontSize: 15,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  featuredCard: {
    width: 180,
    height: 240,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  birdName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  birdSpecies: {
    fontSize: 13,
    color: "#E0E0E0",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  storyCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storyImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E8E8E8",
  },
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 24,
  },
  storyAuthor: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 12,
  },
  storyStats: {
    flexDirection: "row",
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  bannerSection: {
    marginTop: 32,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 14,
    color: "#E0E7FF",
    lineHeight: 20,
  },
});
