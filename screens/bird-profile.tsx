import AnimatedCard from "@/components/ui/animated-card";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BirdProfile() {
  return (
    <AnimatedCard>
      <LinearGradient
        colors={["#fbc2eb", "#a6c1ee"]}
        style={{ height: 180, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={{ uri: "https://via.placeholder.com/200" }}
          style={{ width: 160, height: 160, resizeMode: "contain" }}
        />
      </LinearGradient>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", marginBottom: 4 }}>
          Anna&apos;s Hummingbird
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "#6b7280",
            marginBottom: 12,
          }}
        >
          Calypte anna
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#10b981",
            marginBottom: 12,
          }}
        >
          A tiny jewel that brings wonder year-round
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#374151",
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          Named after Anna Masséna, Duchess of Rivoli, this remarkable
          hummingbird is known for its iridescent rose-pink crown and throat.
          Unlike most hummingbirds, Anna&apos;s are year-round residents along
          the Pacific Coast.
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: "#fee2e2" }]}>
          <Ionicons name="heart" size={18} color="#ef4444" />
          <Text style={styles.statValue}>2,847</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: "#dcfce7" }]}>
          <Ionicons name="sparkles" size={18} color="#10b981" />
          <Text style={styles.statValue}>423</Text>
        </View>
      </View>
      <View
        style={{
          padding: 20,
        }}
      >
        <View style={styles.actions}>
          <TouchableOpacity style={styles.loveButton}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Love</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="sparkles-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
  },
  hero: { height: 180, justifyContent: "center", alignItems: "center" },
  heroImage: { width: 160, height: 160, resizeMode: "contain" },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280",
    marginBottom: 12,
  },
  highlight: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
    width: "100%",
    margin: "auto",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  statValue: { fontWeight: "700", marginLeft: 6 },
  statLabel: { marginLeft: 4, color: "#374151" },
  actions: { flexDirection: "row", gap: 12 },
  loveButton: {
    flex: 1,
    backgroundColor: "#f43f5e",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  supportButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
