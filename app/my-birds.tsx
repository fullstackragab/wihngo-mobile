import BirdCard from "@/components/bird-card";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services/user.service";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyBirds() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const loadMyBirds = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await userService.getOwnedBirds(user.userId);
      setBirds(data);
    } catch (error) {
      console.error("Failed to load birds:", error);
      setBirds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Reload birds when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMyBirds();
    }, [loadMyBirds])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome6 name="lock" size={48} color="#95A5A6" />
        <Text style={styles.emptyText}>Please log in to view your birds</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/welcome")}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (birds.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome6 name="dove" size={64} color="#E8E8E8" />
        <Text style={styles.emptyText}>
          You haven&apos;t added any birds yet
        </Text>
        <Text style={styles.emptySubtext}>
          Start adding birds to build your collection
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-bird")}
        >
          <FontAwesome6 name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Your First Bird</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Birds",
          presentation: "card",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/add-bird")}>
              <FontAwesome6
                name="plus"
                size={20}
                color="#007AFF"
                style={{ marginRight: 16 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={birds}
        keyExtractor={(item) => item.birdId}
        renderItem={({ item }) => (
          <BirdCard
            bird={item}
            onPress={() => router.push(`/bird/${item.birdId}`)}
            onEdit={(bird) => router.push(`/add-bird?birdId=${bird.birdId}`)}
            showActions={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadMyBirds}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9F8",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
