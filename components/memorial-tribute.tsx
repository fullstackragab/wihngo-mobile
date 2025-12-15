/**
 * Memorial Tribute Component
 * Shows tribute information and memorial banner for deceased birds
 */

import { Bird } from "@/types/bird";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MemorialBadge from "./memorial-badge";

interface MemorialTributeProps {
  bird: Bird;
  showBanner?: boolean;
}

export default function MemorialTribute({
  bird,
  showBanner = true,
}: MemorialTributeProps) {
  return (
    <View style={styles.container}>
      {showBanner && (
        <LinearGradient
          colors={["#95A5A6", "#7F8C8D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Image
            source={{
              uri:
                bird.coverImageUrl ||
                bird.imageUrl ||
                "https://via.placeholder.com/200",
            }}
            style={styles.bannerImage}
            blurRadius={2}
          />
          <View style={styles.overlay}>
            <MemorialBadge size="large" />
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.dateText}>Forever in our hearts</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      <View style={styles.tributeContent}>
        <View style={styles.header}>
          <FontAwesome6 name="dove" size={24} color="#7F8C8D" />
          <Text style={styles.title}>Remembering {bird.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.description}>
            {bird.name} brought joy and beauty to our community. Though they are
            no longer with us, their memory lives on in the hearts of all who
            loved them.
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <FontAwesome6 name="heart" size={20} color="#E74C3C" />
            <Text style={styles.statNumber}>{bird.lovedBy || 0}</Text>
            <Text style={styles.statLabel}>People Loved</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome6 name="hand-holding-heart" size={20} color="#95A5A6" />
            <Text style={styles.statNumber}>{bird.supportedBy || 0}</Text>
            <Text style={styles.statLabel}>Supporters</Text>
          </View>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>💛 A Message from the Owner</Text>
          <Text style={styles.messageText}>
            Thank you to everyone who supported {bird.name} during their time
            with us. Your love and generosity made a real difference in their
            care and wellbeing.
          </Text>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#7F8C8D"
          />
          <Text style={styles.noticeText}>
            This profile remains as a tribute to {bird.name}. New donations are
            no longer accepted, but you can still share memories and leave
            messages of support.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    height: 200,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  tributeContent: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
  },
  infoSection: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#95A5A6",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2C3E50",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  messageBox: {
    backgroundColor: "#FFF9E5",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#34495E",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#ECF0F1",
    padding: 16,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#7F8C8D",
  },
});
