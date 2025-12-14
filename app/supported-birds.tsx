import BirdCard from "@/components/bird-card";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SupportedBirds() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupportedBirds();
  }, []);

  const loadSupportedBirds = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await birdService.getSupportedBirds();
      // setBirds(data);
      setBirds([]);
    } catch (error) {
      console.error("Failed to load supported birds:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (birds.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome6 name="hand-holding-heart" size={64} color="#90EE90" />
        <Text style={styles.emptyText}>No supported birds yet</Text>
        <Text style={styles.emptySubtext}>
          Support birds to help them and see them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "Supported Birds", presentation: "card" }}
      />
      <FlatList
        data={birds}
        keyExtractor={(item) => item.birdId}
        renderItem={({ item }) => <BirdCard bird={item} onPress={() => {}} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
