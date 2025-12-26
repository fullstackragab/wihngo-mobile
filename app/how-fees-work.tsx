/**
 * How Fees Work Page
 * Explains Wihngo's fee structure transparently
 */

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HowFeesWork() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("fees.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Intro */}
        <Text style={styles.intro}>{t("fees.intro")}</Text>

        {/* Fee Breakdown */}
        <View style={styles.feeCard}>
          <Text style={styles.feeTitle}>{t("fees.breakdown.title")}</Text>

          <View style={styles.feeRow}>
            <View style={styles.feeIconContainer}>
              <FontAwesome6 name="user" size={16} color="#4ECDC4" />
            </View>
            <View style={styles.feeTextContainer}>
              <Text style={styles.feeLabel}>{t("fees.breakdown.birdOwner")}</Text>
              <Text style={styles.feeValue}>95%</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.feeRow}>
            <View style={styles.feeIconContainer}>
              <FontAwesome6 name="server" size={16} color="#6B7280" />
            </View>
            <View style={styles.feeTextContainer}>
              <Text style={styles.feeLabel}>{t("fees.breakdown.platform")}</Text>
              <Text style={styles.feeValue}>5%</Text>
            </View>
          </View>
        </View>

        {/* What the fee covers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("fees.whatItCovers.title")}</Text>

          <View style={styles.coverItem}>
            <FontAwesome6 name="cloud" size={16} color="#4ECDC4" />
            <Text style={styles.coverText}>{t("fees.whatItCovers.storage")}</Text>
          </View>

          <View style={styles.coverItem}>
            <FontAwesome6 name="server" size={16} color="#4ECDC4" />
            <Text style={styles.coverText}>{t("fees.whatItCovers.hosting")}</Text>
          </View>

          <View style={styles.coverItem}>
            <FontAwesome6 name="shield-halved" size={16} color="#4ECDC4" />
            <Text style={styles.coverText}>{t("fees.whatItCovers.security")}</Text>
          </View>

          <View style={styles.coverItem}>
            <FontAwesome6 name="wrench" size={16} color="#4ECDC4" />
            <Text style={styles.coverText}>{t("fees.whatItCovers.maintenance")}</Text>
          </View>

          <View style={styles.coverItem}>
            <FontAwesome6 name="code" size={16} color="#4ECDC4" />
            <Text style={styles.coverText}>{t("fees.whatItCovers.development")}</Text>
          </View>
        </View>

        {/* Why we charge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("fees.why.title")}</Text>
          <Text style={styles.sectionContent}>{t("fees.why.content")}</Text>
        </View>

        {/* Optional fee coverage */}
        <View style={styles.optionalSection}>
          <FontAwesome6 name="lightbulb" size={20} color="#F59E0B" style={styles.optionalIcon} />
          <Text style={styles.optionalTitle}>{t("fees.optional.title")}</Text>
          <Text style={styles.optionalContent}>{t("fees.optional.content")}</Text>
        </View>
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
  intro: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  feeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  feeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  feeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  feeTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  feeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  coverItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  coverText: {
    fontSize: 15,
    color: "#555",
  },
  optionalSection: {
    backgroundColor: "#FFF9E6",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F59E0B30",
    alignItems: "center",
  },
  optionalIcon: {
    marginBottom: 12,
  },
  optionalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  optionalContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    textAlign: "center",
  },
});
