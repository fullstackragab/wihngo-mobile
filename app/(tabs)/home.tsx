import { NotificationBell } from "@/components/notification-bell";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { birdService } from "@/services/bird.service";
import { storyService } from "@/services/story.service";
import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Tips data - could be fetched from API in the future
const TIPS = [
  { key: "tip1", icon: "heart" as const },
  { key: "tip2", icon: "camera" as const },
  { key: "tip3", icon: "shield-halved" as const },
  { key: "tip4", icon: "leaf" as const },
  { key: "tip5", icon: "hand-holding-heart" as const },
];

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [featuredBirds, setFeaturedBirds] = useState<Bird[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [newBirds, setNewBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greetingMorning");
    if (hour < 17) return t("home.greetingAfternoon");
    return t("home.greetingEvening");
  }, [t]);

  // Get daily tip based on day of year
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const tipIndex = dayOfYear % TIPS.length;
    return TIPS[tipIndex];
  }, []);

  // Select featured bird of the week
  const featuredBirdOfWeek = useMemo(() => {
    if (featuredBirds.length === 0) return null;
    // Use week number to select a featured bird consistently
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    return featuredBirds[weekNumber % featuredBirds.length];
  }, [featuredBirds]);

  const loadHomeData = async () => {
    try {
      // Fetch data in parallel
      const [birdsData, storiesResponse] = await Promise.all([
        birdService.getBirds(),
        storyService.getStories(1, 5),
      ]);

      // Set featured birds (most supported)
      const sortedBySupport = [...birdsData].sort(
        (a, b) => (b.supportedBy || 0) - (a.supportedBy || 0)
      );
      setFeaturedBirds(sortedBySupport.slice(0, 10));

      // Set new birds (most recently added - assuming last in list are newest)
      setNewBirds(birdsData.slice(-5).reverse());

      // Set recent stories
      setRecentStories(storiesResponse.items || []);
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

  const getActivityStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "#22C55E";
      case "Quiet":
        return "#F59E0B";
      case "Inactive":
        return "#9CA3AF";
      case "Memorial":
        return "#8B5CF6";
      default:
        return "#9CA3AF";
    }
  };

  const renderFeaturedBirdCard = ({ item }: { item: Bird }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/bird/${item.birdId}` as any)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
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
            <Text style={styles.statText}>{item.lovedBy || 0}</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome6 name="hand-holding-heart" size={12} color="#4ECDC4" />
            <Text style={styles.statText}>{item.supportedBy || 0}</Text>
          </View>
        </View>
      </View>
      {item.activityStatus && item.activityStatus !== 'Active' && (
        <View
          style={[
            styles.activityBadge,
            { backgroundColor: getActivityStatusColor(item.activityStatus) },
          ]}
        />
      )}
    </TouchableOpacity>
  );

  const renderStoryCard = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`/story/${item.storyId}` as any)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.storyImage} />
      ) : (
        <View style={[styles.storyImage, styles.storyImagePlaceholder]}>
          <FontAwesome6 name="feather" size={24} color="#CBD5E1" />
        </View>
      )}
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.preview}
        </Text>
        <Text style={styles.storyAuthor} numberOfLines={1}>
          {item.birds.length > 0 ? item.birds.join(", ") : item.date}
        </Text>
        <View style={styles.storyStats}>
          <View style={styles.stat}>
            <FontAwesome6 name="heart" size={12} color="#FF6B6B" />
            <Text style={styles.statTextDark}>{item.likeCount || 0}</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome6 name="comment" size={12} color="#64748B" />
            <Text style={styles.statTextDark}>{item.commentCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewBirdCard = ({ item }: { item: Bird }) => (
    <TouchableOpacity
      style={styles.newBirdCard}
      onPress={() => router.push(`/bird/${item.birdId}` as any)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/80" }}
        style={styles.newBirdImage}
      />
      <Text style={styles.newBirdName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.newBirdSpecies} numberOfLines={1}>
        {item.species}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("home.loadingBirds")}</Text>
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          {isAuthenticated && user?.name && (
            <Text style={styles.userName}>{user.name.split(" ")[0]}</Text>
          )}
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

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push("/create-story")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.quickActionGradient}
          >
            <FontAwesome6 name="pen-to-square" size={18} color="#fff" />
            <Text style={styles.quickActionText}>
              {t("home.shareStory")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push("/(tabs)/birds")}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionOutline}>
            <FontAwesome6 name="dove" size={18} color="#4ECDC4" />
            <Text style={styles.quickActionTextOutline}>
              {t("home.exploreBirds")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Featured Bird of the Week */}
      {featuredBirdOfWeek && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="star-circle" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>{t("home.birdOfTheWeek")}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.featuredBirdOfWeek}
            onPress={() =>
              router.push(`/bird/${featuredBirdOfWeek.birdId}` as any)
            }
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  featuredBirdOfWeek.coverImageUrl ||
                  featuredBirdOfWeek.imageUrl ||
                  "https://via.placeholder.com/400x200",
              }}
              style={styles.featuredBirdOfWeekImage}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.featuredBirdOfWeekOverlay}
            >
              <View style={styles.featuredBirdOfWeekInfo}>
                <View style={styles.featuredBirdOfWeekBadge}>
                  <FontAwesome6 name="crown" size={12} color="#F59E0B" />
                  <Text style={styles.featuredBirdOfWeekBadgeText}>
                    {t("home.featured")}
                  </Text>
                </View>
                <Text style={styles.featuredBirdOfWeekName}>
                  {featuredBirdOfWeek.name}
                </Text>
                <Text style={styles.featuredBirdOfWeekSpecies}>
                  {featuredBirdOfWeek.species}
                </Text>
                {featuredBirdOfWeek.tagline && (
                  <Text
                    style={styles.featuredBirdOfWeekTagline}
                    numberOfLines={2}
                  >
                    "{featuredBirdOfWeek.tagline}"
                  </Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Stories */}
      {recentStories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome6 name="book-open" size={16} color="#6366F1" />
              <Text style={styles.sectionTitle}>{t("home.recentStories")}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/stories")}>
              <Text style={styles.seeAll}>{t("home.viewAll")}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recentStories}
            renderItem={renderStoryCard}
            keyExtractor={(item) => item.storyId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Popular Birds */}
      {featuredBirds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome6 name="fire" size={16} color="#EF4444" />
              <Text style={styles.sectionTitle}>{t("home.popularBirds")}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/birds")}>
              <Text style={styles.seeAll}>{t("home.viewAll")}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredBirds.slice(0, 5)}
            renderItem={renderFeaturedBirdCard}
            keyExtractor={(item) => item.birdId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Community Section - New Birds */}
      {newBirds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome6 name="sparkles" size={16} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>{t("home.newToWihngo")}</Text>
            </View>
          </View>
          <FlatList
            horizontal
            data={newBirds}
            renderItem={renderNewBirdCard}
            keyExtractor={(item) => item.birdId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Tip of the Day */}
      <View style={styles.section}>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipIconContainer}>
              <FontAwesome6 name="lightbulb" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.tipTitle}>{t("home.tipOfTheDay")}</Text>
          </View>
          <View style={styles.tipContent}>
            <FontAwesome6
              name={dailyTip.icon}
              size={20}
              color="#64748B"
              style={styles.tipContentIcon}
            />
            <Text style={styles.tipText}>
              {t(`home.tips.${dailyTip.key}`)}
            </Text>
          </View>
        </View>
      </View>

      {/* Empty State when no birds */}
      {featuredBirds.length === 0 && recentStories.length === 0 && (
        <View style={styles.emptyState}>
          <FontAwesome6 name="dove" size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>{t("home.noBirdsYet")}</Text>
          <Text style={styles.emptySubtitle}>{t("home.emptySubtitle")}</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/(tabs)/birds")}
          >
            <Text style={styles.emptyButtonText}>{t("home.exploreBirds")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
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
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.small,
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: Typography.h1,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 2,
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
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    flex: 1,
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  quickActionOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    gap: 8,
  },
  quickActionText: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quickActionTextOutline: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: Typography.small,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  featuredCard: {
    width: 150,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  featuredImage: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.lg,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    borderRadius: BorderRadius.lg,
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  birdName: {
    fontSize: Typography.body,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  birdSpecies: {
    fontSize: Typography.small,
    color: "rgba(255,255,255,0.85)",
    marginBottom: Spacing.xs,
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
  statTextDark: {
    fontSize: Typography.small,
    color: "#64748B",
    fontWeight: "500",
  },
  activityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  featuredBirdOfWeek: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    height: 200,
  },
  featuredBirdOfWeekImage: {
    width: "100%",
    height: "100%",
  },
  featuredBirdOfWeekOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  featuredBirdOfWeekInfo: {
    padding: Spacing.lg,
  },
  featuredBirdOfWeekBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: Spacing.sm,
  },
  featuredBirdOfWeekBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
    textTransform: "uppercase",
  },
  featuredBirdOfWeekName: {
    fontSize: Typography.h1,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featuredBirdOfWeekSpecies: {
    fontSize: Typography.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  featuredBirdOfWeekTagline: {
    fontSize: Typography.small,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
  storyCard: {
    width: 260,
    marginRight: Spacing.md,
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  storyImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E2E8F0",
  },
  storyImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  storyContent: {
    padding: Spacing.md,
  },
  storyTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
    lineHeight: 20,
  },
  storyAuthor: {
    fontSize: Typography.small,
    color: "#64748B",
    marginBottom: Spacing.sm,
  },
  storyStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  newBirdCard: {
    width: 100,
    marginRight: Spacing.md,
    alignItems: "center",
  },
  newBirdImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: "#E2E8F0",
  },
  newBirdName: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  newBirdSpecies: {
    fontSize: Typography.small,
    color: "#64748B",
    textAlign: "center",
  },
  tipCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: "#FFFBEB",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#92400E",
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipContentIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.body,
    color: "#78350F",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.h2,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: "#64748B",
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
