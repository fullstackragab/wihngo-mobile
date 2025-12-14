import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PremiumUpsellModalProps {
  visible: boolean;
  birdId: string;
  birdName: string;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: "color-palette",
    title: "Custom Themes & Covers",
    description: "Personalize with unique frames, badges, and colors",
  },
  {
    icon: "infinite",
    title: "Unlimited Photos & Videos",
    description: "Share as many memories as you want",
  },
  {
    icon: "star",
    title: "Premium Badge",
    description: "Show your bird is celebrated in the community",
  },
  {
    icon: "bookmark",
    title: "Story Highlights",
    description: "Pin your favorite moments to the top",
  },
  {
    icon: "images",
    title: "Memory Collages",
    description: "Create beautiful photo collections",
  },
  {
    icon: "qr-code",
    title: "QR Code Sharing",
    description: "Easy profile sharing with custom QR codes",
  },
  {
    icon: "heart",
    title: "Support Bird Charities",
    description: "10-20% goes to shelters & conservation",
  },
];

export default function PremiumUpsellModal({
  visible,
  birdId,
  birdName,
  onClose,
}: PremiumUpsellModalProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleViewPlans = () => {
    onClose();
    // Navigate to premium plans screen
    router.push(`/premium-plans?birdId=${birdId}`);
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Ionicons name="sparkles" size={56} color="#FFD700" />
            <Text style={styles.title}>Celebrate {birdName}</Text>
            <Text style={styles.subtitle}>
              {t("premium.enhanceExperienceSupport")}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color="#4ECDC4"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              </View>
            ))}
          </View>

          {/* Comparison */}
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>Premium vs Free</Text>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Photos</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.freeValue}>5</Text>
                <Text style={styles.premiumValue}>∞ Unlimited</Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Custom Themes</Text>
              <View style={styles.comparisonValues}>
                <Ionicons name="close-circle" size={20} color="#E74C3C" />
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Premium Badge</Text>
              <View style={styles.comparisonValues}>
                <Ionicons name="close-circle" size={20} color="#E74C3C" />
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Story Highlights</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.freeValue}>0</Text>
                <Text style={styles.premiumValue}>5 pins</Text>
              </View>
            </View>
          </View>

          {/* Charity Message */}
          <View style={styles.charityMessage}>
            <Ionicons name="heart-circle" size={32} color="#FF6B6B" />
            <Text style={styles.charityText}>
              Every premium subscription supports bird charities, shelters, and
              conservation programs. You're not just celebrating your bird —
              you're helping others too! 💚
            </Text>
          </View>

          {/* Pricing Preview */}
          <View style={styles.pricingPreview}>
            <Text style={styles.pricingText}>Starting at</Text>
            <Text style={styles.pricingAmount}>$3.99/month</Text>
            <Text style={styles.pricingSubtext}>
              {t("premium.cancelAnytime")}
            </Text>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.viewPlansButton}
            onPress={handleViewPlans}
          >
            <Text style={styles.viewPlansButtonText}>
              {t("premium.viewPlans")}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
            <Text style={styles.maybeLaterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2C3E50",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  featuresContainer: {
    marginTop: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8F8F7",
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F8F7",
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#7F8C8D",
    lineHeight: 18,
  },
  comparisonContainer: {
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8F8F7",
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  comparisonValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    minWidth: 150,
    justifyContent: "flex-end",
  },
  freeValue: {
    fontSize: 14,
    color: "#7F8C8D",
    width: 60,
    textAlign: "right",
  },
  premiumValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ECDC4",
    width: 80,
    textAlign: "right",
  },
  charityMessage: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFE8E8",
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    alignItems: "flex-start",
  },
  charityText: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  pricingPreview: {
    alignItems: "center",
    paddingVertical: 32,
  },
  pricingText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  pricingAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#4ECDC4",
    marginVertical: 8,
  },
  pricingSubtext: {
    fontSize: 13,
    color: "#7F8C8D",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8F8F7",
    gap: 12,
  },
  viewPlansButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewPlansButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  maybeLaterButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  maybeLaterButtonText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
  },
});
