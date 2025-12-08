import { useAuth } from "@/contexts/auth-context";
import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
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
  const { user } = useAuth();
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
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.featuredImage}
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
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name || "Bird Lover"}!
          </Text>
          <Text style={styles.subtitle}>Discover amazing birds today</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <FontAwesome6 name="magnifying-glass" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      {/* Featured Birds */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Birds</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/birds")}>
            <Text style={styles.seeAll}>See All</Text>
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
            <FontAwesome6 name="dove" size={40} color="#BDC3C7" />
            <Text style={styles.emptyText}>No featured birds yet</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/birds")}
            >
              <Text style={styles.exploreButtonText}>Explore Birds</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Trending Stories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Stories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/stories")}>
            <Text style={styles.seeAll}>See All</Text>
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
            <FontAwesome6 name="book-open" size={40} color="#BDC3C7" />
            <Text style={styles.emptyText}>No stories yet</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/stories")}
            >
              <Text style={styles.exploreButtonText}>Explore Stories</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recently Supported */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Supported</Text>
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
            <FontAwesome6 name="hand-holding-heart" size={40} color="#BDC3C7" />
            <Text style={styles.emptyText}>
              Support a bird to see them here
            </Text>
          </View>
        )}
      </View>

      {/* What's New Banner */}
      <View style={styles.bannerSection}>
        <View style={styles.banner}>
          <FontAwesome6 name="sparkles" size={24} color="#FFD93D" />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>What's New on Wihngo</Text>
            <Text style={styles.bannerText}>
              Share your bird stories and connect with fellow bird lovers!
            </Text>
          </View>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  seeAll: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  featuredCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E8E8E8",
  },
  featuredInfo: {
    padding: 12,
  },
  birdName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  birdSpecies: {
    fontSize: 12,
    color: "#7F8C8D",
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
    color: "#7F8C8D",
  },
  storyCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  storyAuthor: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 12,
  },
  storyStats: {
    flexDirection: "row",
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 12,
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  bannerSection: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  banner: {
    backgroundColor: "#667EEA",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 13,
    color: "#E0E7FF",
  },
});
