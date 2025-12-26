/**
 * Our Principles Page
 * Explains Wihngo's core values and how the platform operates
 */

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PrincipleSection {
  titleKey: string;
  contentKey: string;
  icon: string;
}

export default function OurPrinciples() {
  const router = useRouter();
  const { t } = useTranslation();

  const principles: PrincipleSection[] = [
    {
      titleKey: "principles.hereForBirds.title",
      contentKey: "principles.hereForBirds.content",
      icon: "heart",
    },
    {
      titleKey: "principles.honest.title",
      contentKey: "principles.honest.content",
      icon: "handshake",
    },
    {
      titleKey: "principles.sustainability.title",
      contentKey: "principles.sustainability.content",
      icon: "seedling",
    },
    {
      titleKey: "principles.supportGoesWhere.title",
      contentKey: "principles.supportGoesWhere.content",
      icon: "arrow-right",
    },
    {
      titleKey: "principles.transparency.title",
      contentKey: "principles.transparency.content",
      icon: "eye",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("principles.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {principles.map((principle, index) => (
          <View key={index} style={styles.principleCard}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name={principle.icon as any} size={24} color="#4ECDC4" />
            </View>
            <Text style={styles.principleTitle}>{t(principle.titleKey)}</Text>
            <Text style={styles.principleContent}>{t(principle.contentKey)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  principleCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8FAF8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  principleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  principleContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
});
