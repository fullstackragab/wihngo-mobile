import BirdThumb from "@/components/bird-thumb";
import ErrorView from "@/components/ui/error-view";
import ListEmptyState from "@/components/ui/list-empty-state";
import LoadingScreen from "@/components/ui/loading-screen";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { getBirdsService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SortOption = "name" | "popular" | "supported";

export default function BirdList({
  onPressBird,
}: {
  onPressBird: (bird: Bird) => void;
}) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [filteredBirds, setFilteredBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  useEffect(() => {
    loadBirds();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [birds, searchQuery, sortBy]);

  const loadBirds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBirdsService();
      setBirds(data);
    } catch (err) {
      setError("Failed to load birds. Please try again.");
      console.error("Error loading birds:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBirds();
  };

  const applyFiltersAndSort = () => {
    let result = [...birds];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (bird) =>
          bird.name.toLowerCase().includes(query) ||
          bird.species.toLowerCase().includes(query) ||
          bird.commonName?.toLowerCase().includes(query) ||
          bird.tagline.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popular":
        result.sort((a, b) => b.lovedBy - a.lovedBy);
        break;
      case "supported":
        result.sort((a, b) => b.supportedBy - a.supportedBy);
        break;
    }

    setFilteredBirds(result);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingScreen message="Loading birds..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorView message={error} onRetry={loadBirds} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simplified Header - No title, just search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FontAwesome6
            name="magnifying-glass"
            size={16}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search birds..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <FontAwesome6 name="xmark" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Minimal Sort Pills */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortPill, sortBy === "name" && styles.sortPillActive]}
          onPress={() => setSortBy("name")}
        >
          <Text
            style={[
              styles.sortPillText,
              sortBy === "name" && styles.sortPillTextActive,
            ]}
          >
            A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortPill,
            sortBy === "popular" && styles.sortPillActive,
          ]}
          onPress={() => setSortBy("popular")}
        >
          <Text
            style={[
              styles.sortPillText,
              sortBy === "popular" && styles.sortPillTextActive,
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortPill,
            sortBy === "supported" && styles.sortPillActive,
          ]}
          onPress={() => setSortBy("supported")}
        >
          <Text
            style={[
              styles.sortPillText,
              sortBy === "supported" && styles.sortPillTextActive,
            ]}
          >
            Supported
          </Text>
        </TouchableOpacity>
      </View>

      {/* Birds Grid */}
      <FlatList
        data={filteredBirds}
        keyExtractor={(item) => item.birdId}
        renderItem={({ item }) => (
          <BirdThumb bird={item} onPress={() => onPressBird(item)} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ListEmptyState title="No birds found" message="Start exploring" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    color: "#1A1A1A",
    padding: 0,
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sortPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F5F5F5",
  },
  sortPillActive: {
    backgroundColor: "#1A1A1A",
  },
  sortPillText: {
    fontSize: Typography.small,
    color: "#666",
    fontWeight: "500",
  },
  sortPillTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: "space-between",
  },
});
