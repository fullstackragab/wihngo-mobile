import { STORY_MOODS, StoryMode } from "@/types/story";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MoodSelectorProps = {
  visible: boolean;
  selectedMood?: StoryMode | null;
  onSelect: (mood: StoryMode | null) => void;
  onClose: () => void;
};

export function MoodSelector({
  visible,
  selectedMood,
  onSelect,
  onClose,
}: MoodSelectorProps) {
  const [expandedMood, setExpandedMood] = useState<StoryMode | null>(null);

  const handleSelectMood = (mood: StoryMode) => {
    onSelect(mood);
    onClose();
  };

  const handleSkip = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Choose a mood</Text>
            <Text style={styles.subtitle}>Optional - skip if you prefer</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Mood Grid */}
          <View style={styles.moodGrid}>
            {STORY_MOODS.map((mood) => {
              const isSelected = selectedMood === mood.value;
              const isExpanded = expandedMood === mood.value;

              return (
                <View key={mood.value} style={styles.moodCardWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.moodCard,
                      isSelected && styles.moodCardSelected,
                    ]}
                    onPress={() => handleSelectMood(mood.value)}
                    onLongPress={() =>
                      setExpandedMood(isExpanded ? null : mood.value)
                    }
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        isSelected && styles.moodLabelSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Expanded description */}
                  {isExpanded && (
                    <View style={styles.descriptionCard}>
                      <Text style={styles.descriptionText}>
                        {mood.description}
                      </Text>
                      <Text style={styles.exampleText}>{mood.example}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Info tip */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Long press any mood to see details and examples
            </Text>
          </View>
        </ScrollView>

        {/* Skip Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip / No Mood</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  moodCardWrapper: {
    width: "48%",
  },
  moodCard: {
    aspectRatio: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  moodCardSelected: {
    backgroundColor: "#E8F5F5",
    borderColor: "#4ECDC4",
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  moodLabelSelected: {
    color: "#4ECDC4",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4ECDC4",
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionCard: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4ECDC4",
  },
  descriptionText: {
    fontSize: 12,
    color: "#2C3E50",
    marginBottom: 6,
    lineHeight: 18,
  },
  exampleText: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#E8F5F5",
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2C3E50",
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  skipButton: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F8C8D",
  },
});
