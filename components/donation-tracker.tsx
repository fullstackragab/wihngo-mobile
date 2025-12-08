import { theme } from "@/constants/theme";
import { DonationTracker as DonationTrackerType } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type DonationTrackerProps = {
  birdId: string;
  birdName: string;
  donations: DonationTrackerType;
  isPremium: boolean;
  onSeeAll?: () => void;
};

export function DonationTracker({
  birdId,
  birdName,
  donations,
  isPremium,
  onSeeAll,
}: DonationTrackerProps) {
  if (!isPremium) {
    return null;
  }

  if (donations.totalDonations === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="heart-circle" size={24} color="#FF6B6B" />
          <Text style={styles.title}>Community Support</Text>
        </View>

        <View style={styles.emptyState}>
          <Ionicons
            name="heart-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyText}>No donations yet</Text>
          <Text style={styles.emptySubtext}>
            Your community can show their love through support
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart-circle" size={24} color="#FF6B6B" />
        <Text style={styles.title}>Community Support</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        )}
      </View>

      {/* Total Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${donations.totalDonations.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Raised</Text>
          <View style={styles.heartIcon}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{donations.donorCount}</Text>
          <Text style={styles.statLabel}>
            {donations.donorCount === 1 ? "Supporter" : "Supporters"}
          </Text>
          <View style={styles.heartIcon}>
            <Ionicons name="people" size={16} color={theme.colors.primary} />
          </View>
        </View>
      </View>

      {/* Charity Allocation */}
      {donations.charityAllocation &&
        donations.charityAllocation.length > 0 && (
          <View style={styles.charitySection}>
            <Text style={styles.sectionTitle}>Supporting Bird Charities</Text>
            {donations.charityAllocation.map((charity, index) => (
              <View key={index} style={styles.charityItem}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <View style={styles.charityInfo}>
                  <Text style={styles.charityName}>{charity.charityName}</Text>
                  <Text style={styles.charityAmount}>
                    ${charity.amount.toFixed(2)} ({charity.percentage}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      {/* Recent Donors */}
      {donations.recentDonors.length > 0 && (
        <View style={styles.donorsSection}>
          <Text style={styles.sectionTitle}>Recent Supporters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {donations.recentDonors.slice(0, 5).map((donor, index) => (
              <View key={index} style={styles.donorCard}>
                <View style={styles.donorHeader}>
                  <Ionicons
                    name="person-circle"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.donorName}>{donor.name}</Text>
                </View>
                <Text style={styles.donorAmount}>
                  ${donor.amount.toFixed(2)}
                </Text>
                {donor.message && (
                  <Text style={styles.donorMessage} numberOfLines={2}>
                    {donor.message}
                  </Text>
                )}
                <Text style={styles.donorDate}>
                  {new Date(donor.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Message */}
      <View style={styles.messageBox}>
        <Ionicons
          name="information-circle"
          size={16}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.message}>
          All donations help care for {birdName} and support bird conservation
          efforts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    position: "relative",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  heartIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    opacity: 0.3,
  },
  charitySection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  charityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
  },
  charityInfo: {
    flex: 1,
  },
  charityName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  charityAmount: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  donorsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || "#e0e0e0",
  },
  donorCard: {
    width: 160,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  donorHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  donorName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 4,
    textAlign: "center",
  },
  donorAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  donorMessage: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 6,
    lineHeight: 16,
  },
  donorDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
  },
  message: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
});
