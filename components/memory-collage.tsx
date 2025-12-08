import { theme } from "@/constants/theme";
import { MemoryCollage } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MemoryCollageCardProps = {
  collage: MemoryCollage;
  onPress?: () => void;
};

export function MemoryCollageCard({
  collage,
  onPress,
}: MemoryCollageCardProps) {
  const displayImages = collage.imageUrls.slice(0, 4);
  const remainingCount = collage.imageUrls.length - 4;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageGrid}>
        {displayImages.map((url, index) => (
          <View
            key={index}
            style={[
              styles.gridImage,
              displayImages.length === 1 && styles.gridImageFull,
              displayImages.length === 2 && styles.gridImageHalf,
            ]}
          >
            <Image source={{ uri: url }} style={styles.image} />
            {index === 3 && remainingCount > 0 && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{collage.title}</Text>
        {collage.description && (
          <Text style={styles.description} numberOfLines={2}>
            {collage.description}
          </Text>
        )}
        <View style={styles.meta}>
          <Ionicons
            name="images"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.metaText}>
            {collage.imageUrls.length}{" "}
            {collage.imageUrls.length === 1 ? "photo" : "photos"}
          </Text>
          <Text style={styles.date}>
            {new Date(collage.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

type MemoryCollageListProps = {
  birdId: string;
  collages: MemoryCollage[];
  onCreateNew?: () => void;
  isPremium: boolean;
};

export function MemoryCollageList({
  birdId,
  collages,
  onCreateNew,
  isPremium,
}: MemoryCollageListProps) {
  if (!isPremium) {
    return null;
  }

  if (collages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="albums" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Memory Collages</Text>
        </View>

        <View style={styles.empty}>
          <Ionicons
            name="images-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyText}>No memory collages yet</Text>
          <Text style={styles.emptySubtext}>
            Create beautiful photo albums to celebrate special moments
          </Text>
          {onCreateNew && (
            <Pressable style={styles.createButton} onPress={onCreateNew}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Collage</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="albums" size={24} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Memory Collages</Text>
        {onCreateNew && (
          <Pressable style={styles.addButton} onPress={onCreateNew}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {collages.map((collage) => (
          <MemoryCollageCard
            key={collage.id}
            collage={collage}
            onPress={() => console.log("View collage:", collage.id)}
          />
        ))}
      </ScrollView>
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
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight || "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    height: 200,
  },
  gridImage: {
    width: "50%",
    height: "50%",
    padding: 1,
  },
  gridImageFull: {
    width: "100%",
    height: "100%",
  },
  gridImageHalf: {
    width: "50%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
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
