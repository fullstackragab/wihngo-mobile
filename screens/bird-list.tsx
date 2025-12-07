import BirdCard from "@/components/bird-card";
import { getBirdsService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function BirdList() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBirds();
  }, []);

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
    }
  };

  const handleBirdPress = (bird: Bird) => {
    // Navigate to bird detail screen
    router.push({
      pathname: "../bird-profile",
      params: { birdId: bird.birdId },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading birds...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={birds}
      keyExtractor={(item) => item.birdId}
      renderItem={({ item }) => (
        <BirdCard bird={item} onPress={handleBirdPress} />
      )}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No birds found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  listContainer: {
    padding: 16,
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
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
