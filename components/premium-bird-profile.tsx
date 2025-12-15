import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Bird } from "@/types/bird";
import { BirdPremiumSubscription, PremiumStyle } from "@/types/premium";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PremiumBadge } from "./premium-badge";

interface PremiumBirdProfileProps {
  bird: Bird;
  subscription: BirdPremiumSubscription;
  premiumStyle?: PremiumStyle;
  onUpgrade?: () => void;
  onEdit?: () => void;
  isOwner: boolean;
}

export function PremiumBirdProfile({
  bird,
  subscription,
  premiumStyle,
  onUpgrade,
  onEdit,
  isOwner,
}: PremiumBirdProfileProps) {
  const isPremium = subscription.status === "active";
  const isLifetime = subscription.plan === "lifetime";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Cover Image */}
      {premiumStyle?.coverImageUrl && (
        <Image
          source={{ uri: premiumStyle.coverImageUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      {/* Bird Header with Premium Badge */}
      <View
        style={[
          styles.header,
          premiumStyle?.themeId && {
            backgroundColor: premiumStyle.highlightColor || "#FFF9E5",
          },
        ]}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: bird.imageUrl || "https://via.placeholder.com/120" }}
            style={[
              styles.profileImage,
              premiumStyle?.frameId && styles.framedImage,
            ]}
          />
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{bird.name}</Text>
              {isPremium && <PremiumBadge size="medium" />}
              {isLifetime && (
                <Text style={styles.lifetimeBadge}>🌟 Lifetime</Text>
              )}
            </View>
            <Text style={styles.species}>{bird.species}</Text>
          </View>
        </View>

        {/* Love & Support Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>❤️ {bird.lovedBy || 0}</Text>
            <Text style={styles.statLabel}>Loves</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>🐦 {bird.supportedBy || 0}</Text>
            <Text style={styles.statLabel}>Supporters</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>💝 {bird.totalSupport || 0}</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>

        {/* Owner Actions */}
        {isOwner && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
            {!isPremium && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={onUpgrade}
              >
                <Text style={styles.upgradeButtonText}>✨ Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Premium Features Section */}
      {isPremium && (
        <>
          {/* Premium Features Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Premium Features Active</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Custom profile themes</Text>
              <Text style={styles.featureItem}>
                ✓ Unlimited photos & videos
              </Text>
              <Text style={styles.featureItem}>✓ Story highlights</Text>
              <Text style={styles.featureItem}>✓ Best moments timeline</Text>
              <Text style={styles.featureItem}>✓ Memory collages</Text>
            </View>
          </View>

          {/* Donation Tracker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💝 Support & Donations</Text>
            <View style={styles.donationInfo}>
              <Text style={styles.donationText}>
                Total Support: ${bird.totalSupport || 0}
              </Text>
              <Text style={styles.donationText}>
                Supporters: {bird.supportedBy || 0}
              </Text>
            </View>

            {/* Charity Allocation Info */}
            <View style={styles.charityInfo}>
              <Text style={styles.charityText}>
                🏥{" "}
                {subscription.plan === "lifetime"
                  ? "20%"
                  : subscription.plan === "yearly"
                  ? "15%"
                  : "10%"}{" "}
                of premium proceeds support bird charities, shelters &
                conservation programs
              </Text>
            </View>
          </View>

          {/* Share Profile Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Share Profile</Text>
            <View style={styles.shareInfo}>
              <Text style={styles.shareText}>
                Share {bird.name}'s profile to spread the love!
              </Text>
              <Text style={styles.shareLink}>wihngo://bird/{bird.birdId}</Text>
            </View>
          </View>
        </>
      )}

      {/* Free User Upgrade Prompt */}
      {!isPremium && (
        <View style={styles.upgradePrompt}>
          <Text style={styles.upgradePromptTitle}>
            ✨ Celebrate {bird.name} with Premium
          </Text>
          <Text style={styles.upgradePromptText}>
            Show your love with custom themes, unlimited memories, and support
            bird charities at the same time! 💛
          </Text>
          <TouchableOpacity
            style={styles.upgradePromptButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradePromptButtonText}>
              See Premium Plans
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About {bird.name}</Text>
        <Text style={styles.aboutText}>
          {bird.description ||
            `${bird.name} is a beautiful ${bird.species} spreading joy in the Wihngo community! 🐦💛`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  coverImage: {
    width: "100%",
    height: 200,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: "#FFF9E5",
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  framedImage: {
    borderWidth: 5,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nameSection: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.h2,
    fontWeight: "bold",
    marginRight: Spacing.sm,
    color: "#333",
  },
  species: {
    fontSize: Typography.body,
    color: "#666",
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: Typography.small,
    color: "#666",
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: Typography.body,
    color: "#333",
    fontWeight: "600",
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: "#FFD700",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  upgradeButtonText: {
    fontSize: Typography.body,
    color: "#333",
    fontWeight: "bold",
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    marginBottom: Spacing.md,
    color: "#333",
  },
  charityInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "#E8F5E9",
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  charityText: {
    fontSize: Typography.small,
    color: "#2E7D32",
    lineHeight: 20,
  },
  upgradePrompt: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: "#FFF9E5",
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "#FFD700",
    alignItems: "center",
  },
  upgradePromptTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  upgradePromptText: {
    fontSize: Typography.body,
    color: "#666",
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  upgradePromptButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  upgradePromptButtonText: {
    fontSize: Typography.body,
    fontWeight: "bold",
    color: "#333",
  },
  aboutText: {
    fontSize: Typography.body,
    color: "#666",
    lineHeight: 24,
  },
  lifetimeBadge: {
    fontSize: Typography.small,
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: Spacing.xs,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    fontSize: Typography.body,
    color: "#666",
    marginBottom: Spacing.xs,
  },
  donationInfo: {
    backgroundColor: "#F9F9F9",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  donationText: {
    fontSize: Typography.body,
    color: "#333",
    marginBottom: Spacing.xs,
  },
  shareInfo: {
    backgroundColor: "#F9F9F9",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  shareText: {
    fontSize: Typography.body,
    color: "#666",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  shareLink: {
    fontSize: Typography.small,
    color: "#4CAF50",
    fontFamily: "monospace",
  },
});
