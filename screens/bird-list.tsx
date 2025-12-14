import BirdThumb from "@/components/bird-thumb";
import ErrorView from "@/components/ui/error-view";
import ListEmptyState from "@/components/ui/list-empty-state";
import LoadingScreen from "@/components/ui/loading-screen";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useBirdsInfinite } from "@/hooks/useBirds";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
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
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBirdsInfinite();

  const birds = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [refreshing, setRefreshing] = useState(false);

  const filteredBirds = useMemo(() => {
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

    return result;
  }, [birds, searchQuery, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingScreen message="Loading birds..." />
      </View>
    );
  }

  if (queryError) {
    return (
      <View style={styles.container}>
        <ErrorView
          message="Failed to load birds. Please try again."
          onRetry={() => refetch()}
        />
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
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <ListEmptyState title="No birds found" message="Start exploring" />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <LoadingScreen message="Loading more birds..." />
            </View>
          ) : null
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
    paddingTop: Spacing.xl,
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
  footer: {
    paddingVertical: Spacing.lg,
  },
});
