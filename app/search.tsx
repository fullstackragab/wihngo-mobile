import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SearchTab = "all" | "birds" | "stories";

export default function Search() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [loading, setLoading] = useState(false);
  const [birdResults, setBirdResults] = useState<Bird[]>([]);
  const [storyResults, setStoryResults] = useState<Story[]>([]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setBirdResults([]);
      setStoryResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: API calls
      // const results = await searchService.search(searchQuery);
      // setBirdResults(results.birds);
      // setStoryResults(results.stories);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBirdItem = ({ item }: { item: Bird }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/bird/${item.birdId}`)}
    >
      <Image
        source={item.imageUrl || "https://via.placeholder.com/60"}
        style={styles.resultImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>{item.species}</Text>
        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <FontAwesome6 name="heart" size={12} color="#FF6B6B" />
            <Text style={styles.resultStatText}>{item.lovedBy}</Text>
          </View>
          <View style={styles.resultStat}>
            <FontAwesome6 name="hand-holding-heart" size={12} color="#10b981" />
            <Text style={styles.resultStatText}>{item.supportedBy}</Text>
          </View>
        </View>
      </View>
      <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
    </TouchableOpacity>
  );

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`./story/${item.storyId}`)}
    >
      {item.imageUrl && (
        <Image source={item.imageUrl} style={styles.resultImage} contentFit="cover" cachePolicy="memory-disk" />
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.resultSubtitle}>
          {t("home.by")} {item.userName}
        </Text>
        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <FontAwesome6 name="heart" size={12} color="#FF6B6B" />
            <Text style={styles.resultStatText}>{item.likes}</Text>
          </View>
          <View style={styles.resultStat}>
            <FontAwesome6 name="comment" size={12} color="#95A5A6" />
            <Text style={styles.resultStatText}>{item.commentsCount}</Text>
          </View>
        </View>
      </View>
      <FontAwesome6 name="chevron-right" size={16} color="#95A5A6" />
    </TouchableOpacity>
  );

  const getFilteredResults = () => {
    switch (activeTab) {
      case "birds":
        return birdResults;
      case "stories":
        return storyResults;
      case "all":
      default:
        return [...birdResults.slice(0, 3), ...storyResults.slice(0, 3)];
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome6
          name="magnifying-glass"
          size={18}
          color="#95A5A6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search.searchPlaceholder")}
          placeholderTextColor="#95A5A6"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <FontAwesome6 name="xmark-circle" size={18} color="#95A5A6" solid />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.tabActive]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.tabTextActive,
            ]}
          >
            {t("search.all")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "birds" && styles.tabActive]}
          onPress={() => setActiveTab("birds")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "birds" && styles.tabTextActive,
            ]}
          >
            {t("tabs.birds")} ({birdResults.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "stories" && styles.tabActive]}
          onPress={() => setActiveTab("stories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stories" && styles.tabTextActive,
            ]}
          >
            {t("tabs.stories")} ({storyResults.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : query.trim().length === 0 ? (
        <View style={styles.centerContainer}>
          <FontAwesome6 name="magnifying-glass" size={60} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>{t("search.searchTitle")}</Text>
          <Text style={styles.emptyText}>{t("search.searchDescription")}</Text>
        </View>
      ) : (
        <FlatList
          data={
            activeTab === "birds"
              ? birdResults
              : activeTab === "stories"
              ? storyResults
              : activeTab === "users"
              ? userResults
              : getFilteredResults()
          }
          renderItem={({ item }: { item: Bird | Story | User }) => {
            if ("birdId" in item) {
              return renderBirdItem({ item: item as Bird });
            } else if ("storyId" in item) {
              return renderStoryItem({ item: item as Story });
            } else {
              return renderUserItem({ item: item as User });
            }
          }}
          keyExtractor={(item: any, index: number) =>
            item.birdId || item.storyId || item.userId || index.toString()
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <FontAwesome6
                name="circle-exclamation"
                size={60}
                color="#BDC3C7"
              />
              <Text style={styles.emptyTitle}>{t("search.noResults")}</Text>
              <Text style={styles.emptyText}>
                {t("search.noResultsDescription")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: "#4ECDC4",
  },
  tabText: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 6,
  },
  resultStats: {
    flexDirection: "row",
    gap: 12,
  },
  resultStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultStatText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userBio: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 4,
  },
});
