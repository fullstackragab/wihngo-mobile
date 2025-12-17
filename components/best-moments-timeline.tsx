import { theme } from "@/constants/theme";
import { BestMoment } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BestMomentCardProps = {
  moment: BestMoment;
  onPress?: () => void;
  isFirst?: boolean;
};

function BestMomentCard({ moment, onPress, isFirst }: BestMomentCardProps) {
  return (
    <View style={styles.momentContainer}>
      <View style={styles.timeline}>
        <View style={[styles.dot, isFirst && styles.dotFirst]} />
        <View style={styles.line} />
      </View>

      <Pressable style={styles.momentCard} onPress={onPress}>
        {moment.imageUrl && (
          <Image source={moment.imageUrl} style={styles.momentImage} contentFit="cover" cachePolicy="memory-disk" />
        )}

        <View style={styles.momentContent}>
          <View style={styles.momentHeader}>
            <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
            <Text style={styles.momentTitle}>{moment.title}</Text>
          </View>

          <Text style={styles.momentDescription}>{moment.description}</Text>

          <View style={styles.momentFooter}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.momentDate}>
              {new Date(moment.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

type BestMomentsTimelineProps = {
  birdId: string;
  moments: BestMoment[];
  onAddMoment?: () => void;
  isPremium: boolean;
  isOwner?: boolean;
};

export function BestMomentsTimeline({
  birdId,
  moments,
  onAddMoment,
  isPremium,
  isOwner = false,
}: BestMomentsTimelineProps) {
  if (!isPremium) {
    return null;
  }

  const sortedMoments = [...moments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (moments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="star" size={24} color={theme.colors.accent} />
            <Text style={styles.headerTitle}>Best Moments</Text>
          </View>
          {isOwner && onAddMoment && (
            <Pressable style={styles.addButton} onPress={onAddMoment}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="star-outline"
              size={48}
              color={theme.colors.textSecondary}
            />
          </View>
          <Text style={styles.emptyText}>No special moments yet</Text>
          <Text style={styles.emptySubtext}>
            Celebrate the memorable times in your bird&apos;s life
          </Text>
          {isOwner && onAddMoment && (
            <Pressable style={styles.createButton} onPress={onAddMoment}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Add First Moment</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="star" size={24} color={theme.colors.accent} />
          <Text style={styles.headerTitle}>Best Moments</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{moments.length}</Text>
          </View>
        </View>
        {isOwner && onAddMoment && (
          <Pressable style={styles.addButton} onPress={onAddMoment}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.timelineContainer}>
        {sortedMoments.map((moment, index) => (
          <BestMomentCard
            key={moment.id}
            moment={moment}
            isFirst={index === 0}
            onPress={() => console.log("View moment:", moment.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight || "#e3f2fd",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  momentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeline: {
    width: 32,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dotFirst: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border || "#e0e0e0",
    marginTop: 4,
  },
  momentCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginLeft: 8,
  },
  momentImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f5",
  },
  momentContent: {
    padding: 12,
  },
  momentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  momentDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  momentFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  momentDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight || "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
