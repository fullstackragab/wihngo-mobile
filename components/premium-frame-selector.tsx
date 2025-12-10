import { theme } from "@/constants/theme";
import { useNotifications } from "@/contexts/notification-context";
import { updateBirdPremiumStyle } from "@/services/premium.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Frame = {
  id: string;
  name: string;
  color: string;
  preview: string;
};

const AVAILABLE_FRAMES: Frame[] = [
  { id: "gold", name: "Gold", color: "#FFD700", preview: "⬛" },
  { id: "silver", name: "Silver", color: "#C0C0C0", preview: "⬛" },
  { id: "rainbow", name: "Rainbow", color: "linear", preview: "🌈" },
  { id: "nature", name: "Nature", color: "#228B22", preview: "🍃" },
  { id: "ocean", name: "Ocean", color: "#006994", preview: "🌊" },
  { id: "sunset", name: "Sunset", color: "#FF6B35", preview: "🌅" },
];

type PremiumFrameSelectorProps = {
  birdId: string;
  currentFrameId?: string;
  onFrameUpdate?: (frameId: string) => void;
};

export function PremiumFrameSelector({
  birdId,
  currentFrameId,
  onFrameUpdate,
}: PremiumFrameSelectorProps) {
  const [selectedFrame, setSelectedFrame] = useState(currentFrameId);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const handleFrameSelect = async (frameId: string) => {
    setIsLoading(true);
    try {
      await updateBirdPremiumStyle(birdId, { frameId });
      setSelectedFrame(frameId);
      onFrameUpdate?.(frameId);
      // Success - user sees updated frame
    } catch (error) {
      console.error("Failed to update frame:", error);
      addNotification(
        "recommendation",
        "Frame Update Error",
        "Failed to update frame. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Frame</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.frameList}
      >
        {AVAILABLE_FRAMES.map((frame) => (
          <Pressable
            key={frame.id}
            style={[
              styles.frameItem,
              selectedFrame === frame.id && styles.frameItemSelected,
            ]}
            onPress={() => handleFrameSelect(frame.id)}
            disabled={isLoading}
          >
            <View
              style={[
                styles.framePreview,
                { borderColor: frame.color, borderWidth: 4 },
              ]}
            >
              <Text style={styles.frameEmoji}>{frame.preview}</Text>
            </View>
            <Text style={styles.frameName}>{frame.name}</Text>
            {selectedFrame === frame.id && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.primary}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 12,
  },
  frameList: {
    flexDirection: "row",
  },
  frameItem: {
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    minWidth: 100,
  },
  frameItemSelected: {
    backgroundColor: theme.colors.primaryLight || "#e3f2fd",
  },
  framePreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  frameEmoji: {
    fontSize: 24,
  },
  frameName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
});
