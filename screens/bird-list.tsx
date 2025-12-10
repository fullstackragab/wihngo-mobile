import BirdThumb from "@/components/bird-thumb";
import ErrorView from "@/components/ui/error-view";
import ListEmptyState from "@/components/ui/list-empty-state";
import LoadingScreen from "@/components/ui/loading-screen";
import { getBirdsService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SortOption = "name" | "popular" | "recent" | "supported";
type FilterOption = {
  species?: string;
  location?: string;
  isMemorial?: boolean;
};

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOption>({});

  useEffect(() => {
    loadBirds();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [birds, searchQuery, sortBy, filters]);

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

    // Apply filters
    if (filters.species) {
      result = result.filter((bird) =>
        bird.species.toLowerCase().includes(filters.species!.toLowerCase())
      );
    }

    if (filters.location) {
      result = result.filter((bird) =>
        bird.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.isMemorial !== undefined) {
      result = result.filter((bird) => bird.isMemorial === filters.isMemorial);
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
      case "recent":
        // Assuming newest first - would need createdAt field
        break;
    }

    setFilteredBirds(result);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setSortBy("name");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Birds</Text>
        </View>
        <LoadingScreen message="Loading birds..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Birds</Text>
        </View>
        <ErrorView message={error} onRetry={loadBirds} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Birds</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <FontAwesome6 name="filter" size={20} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome6
          name="magnifying-glass"
          size={16}
          color="#95A5A6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search birds by name or species..."
          placeholderTextColor="#95A5A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <FontAwesome6 name="xmark" size={16} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "name" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("name")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "name" && styles.sortButtonTextActive,
            ]}
          >
            A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "popular" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("popular")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "popular" && styles.sortButtonTextActive,
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "supported" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("supported")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "supported" && styles.sortButtonTextActive,
            ]}
          >
            Supported
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "recent" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("recent")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "recent" && styles.sortButtonTextActive,
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(filters.species ||
        filters.location ||
        filters.isMemorial !== undefined) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersLabel}>Filters:</Text>
          <View style={styles.filterTags}>
            {filters.species && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{filters.species}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, species: undefined })}
                >
                  <FontAwesome6 name="xmark" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {filters.location && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{filters.location}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFilters({ ...filters, location: undefined })
                  }
                >
                  <FontAwesome6 name="xmark" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {filters.isMemorial !== undefined && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Memorial</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFilters({ ...filters, isMemorial: undefined })
                  }
                >
                  <FontAwesome6 name="xmark" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Birds List */}
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
          <ListEmptyState
            icon="dove"
            title={
              searchQuery || Object.keys(filters).length > 0
                ? "No birds match your search"
                : "No birds found"
            }
            message={
              searchQuery || Object.keys(filters).length > 0
                ? "Try adjusting your filters or search terms"
                : "Start adding birds to your collection"
            }
            actionLabel={
              searchQuery || Object.keys(filters).length > 0
                ? "Clear Filters"
                : undefined
            }
            onAction={
              searchQuery || Object.keys(filters).length > 0
                ? clearFilters
                : undefined
            }
          />
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <FontAwesome6 name="xmark" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.filterLabel}>Species</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., Hummingbird"
                placeholderTextColor="#95A5A6"
                value={filters.species || ""}
                onChangeText={(text) =>
                  setFilters({ ...filters, species: text || undefined })
                }
              />

              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., California"
                placeholderTextColor="#95A5A6"
                value={filters.location || ""}
                onChangeText={(text) =>
                  setFilters({ ...filters, location: text || undefined })
                }
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() =>
                  setFilters({
                    ...filters,
                    isMemorial: filters.isMemorial === true ? undefined : true,
                  })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    filters.isMemorial && styles.checkboxChecked,
                  ]}
                >
                  {filters.isMemorial && (
                    <FontAwesome6 name="check" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Memorial Birds Only</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  sortButtonActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  activeFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activeFiltersLabel: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  filterTags: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#667EEA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterTagText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  clearFilters: {
    fontSize: 12,
    color: "#E74C3C",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
    gap: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#95A5A6",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#95A5A6",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
    marginTop: 12,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#2C3E50",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#4ECDC4",
    alignItems: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
