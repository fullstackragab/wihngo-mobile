import AnimatedCard from "@/components/ui/animated-card";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function UserProfile() {
  return (
    <AnimatedCard>
      <LinearGradient colors={["#34d399", "#2dd4bf"]} style={{ height: 140 }} />

      <View style={{ alignItems: "center", marginTop: -50 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            elevation: 4,
          }}
        >
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={{ width: 64, height: 64, borderRadius: 32 }}
          />
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Sarah Chen
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#374151",
            lineHeight: 22,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Bird lover and backyard habitat creator. Finding peace in the flutter
          of wings.
        </Text>
      </View>
      <View style={styles.stats}>
        <StatCard value="12" label="Birds Loved" color="#ef4444" bg="#fee2e2" />
        <StatCard value="8" label="Stories" color="#f59e0b" bg="#fef3c7" />
        <StatCard value="5" label="Supported" color="#10b981" bg="#dcfce7" />
      </View>
    </AnimatedCard>
  );
}

function StatCard({
  value,
  label,
  color,
  bg,
}: {
  value: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
  },
  header: { height: 140 },
  avatarWrapper: { alignItems: "center", marginTop: -50 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  content: { padding: 20 },
  name: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metaText: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  bio: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 0,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, color: "#374151", marginTop: 4 },
});
