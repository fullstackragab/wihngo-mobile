import BirdProfile from "@/screens/bird-profile";
import { birdService } from "@/services/bird.service";
import { Bird } from "@/types/bird";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BirdDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [bird, setBird] = useState<Bird | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBird();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBird = async () => {
    try {
      setLoading(true);
      setError(null);
      const birdData = await birdService.getBirdById(id);
      setBird(birdData);
    } catch (err: any) {
      console.error("Error loading bird:", err);
      setError(err.message || "Failed to load bird");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{ title: t("birdProfile.loadingBird"), headerShown: false }}
        />
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>
              {t("birdProfile.loadingBird")}
            </Text>
          </View>
        </View>
      </>
    );
  }

  if (error || !bird) {
    return (
      <>
        <Stack.Screen
          options={{ title: t("birdProfile.loadingBird"), headerShown: false }}
        />
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
            <Text style={styles.errorText}>
              {error || t("birdProfile.birdNotFound")}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadBird}>
              <Text style={styles.retryButtonText}>
                {t("birdProfile.retry")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: bird.name || "Bird Profile",
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <BirdProfile bird={bird} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
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
});
