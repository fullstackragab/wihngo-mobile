import {
  getBirdCharityImpact,
  getCharityPartners,
  getGlobalCharityImpact,
} from "@/services/premium.service";
import {
  CharityImpact,
  CharityPartner,
  GlobalCharityImpact,
} from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CharityImpactScreenProps {
  birdId?: string; // If provided, show bird-specific impact
  showGlobal?: boolean; // Show global impact
}

export default function CharityImpactScreen({
  birdId,
  showGlobal = true,
}: CharityImpactScreenProps) {
  const { t } = useTranslation();

  const [birdImpact, setBirdImpact] = useState<CharityImpact | null>(null);
  const [globalImpact, setGlobalImpact] = useState<GlobalCharityImpact | null>(
    null
  );
  const [partners, setPartners] = useState<CharityPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [birdId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const promises = [];

      if (birdId) {
        promises.push(
          getBirdCharityImpact(birdId)
            .then(setBirdImpact)
            .catch((error) => {
              console.error("Error loading bird impact:", error);
              return null;
            })
        );
      }

      if (showGlobal) {
        promises.push(
          getGlobalCharityImpact()
            .then(setGlobalImpact)
            .catch((error) => {
              console.error("Error loading global impact:", error);
              return null;
            })
        );
      }

      promises.push(
        getCharityPartners()
          .then(setPartners)
          .catch((error) => {
            console.error("Error loading partners:", error);
            return [];
          })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error loading charity data:", error);
      Alert.alert(t("premium.error"), t("premium.failedToLoadCharityData"));
    } finally {
      setLoading(false);
    }
  };

  const openPartnerWebsite = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t("common.error"), t("common.couldNotOpenLink"));
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("premium.loadingImpact")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="heart" size={48} color="#FF6B6B" />
        <Text style={styles.title}>{t("premium.charityImpact")}</Text>
        <Text style={styles.subtitle}>{t("premium.makingADifference")}</Text>
      </View>

      {/* Bird Impact (if provided) */}
      {birdId && birdImpact && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>
              {t("premium.yourBirdContribution")}
            </Text>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.impactItem}>
              <View
                style={[
                  styles.impactIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="cash" size={24} color="#4CAF50" />
              </View>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>
                  ${birdImpact.totalContributed.toFixed(2)}
                </Text>
                <Text style={styles.impactLabel}>
                  {t("premium.totalContributed")}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.impactStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={18} color="#FF6B6B" />
                <Text style={styles.statValue}>{birdImpact.birdsHelped}</Text>
                <Text style={styles.statLabel}>{t("premium.birdsHelped")}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="home" size={18} color="#4ECDC4" />
                <Text style={styles.statValue}>
                  {birdImpact.sheltersSupported}
                </Text>
                <Text style={styles.statLabel}>
                  {t("premium.sheltersSupported")}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="leaf" size={18} color="#66BB6A" />
                <Text style={styles.statValue}>
                  {birdImpact.conservationProjects}
                </Text>
                <Text style={styles.statLabel}>
                  {t("premium.projectsFunded")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Global Impact */}
      {showGlobal && globalImpact && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe" size={20} color="#4ECDC4" />
            <Text style={styles.sectionTitle}>
              {t("premium.communityImpact")}
            </Text>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.impactItem}>
              <View
                style={[
                  styles.impactIconContainer,
                  { backgroundColor: "#E1F5FE" },
                ]}
              >
                <Ionicons name="people" size={24} color="#03A9F4" />
              </View>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>
                  {globalImpact.totalSubscribers}
                </Text>
                <Text style={styles.impactLabel}>
                  {t("premium.activeCelebrators")}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.impactItem}>
              <View
                style={[
                  styles.impactIconContainer,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="cash" size={24} color="#FF9800" />
              </View>
              <View style={styles.impactContent}>
                <Text style={styles.impactValue}>
                  ${globalImpact.totalContributed.toLocaleString()}
                </Text>
                <Text style={styles.impactLabel}>
                  {t("premium.totalRaised")}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.impactStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={18} color="#FF6B6B" />
                <Text style={styles.statValue}>{globalImpact.birdsHelped}</Text>
                <Text style={styles.statLabel}>{t("premium.birdsHelped")}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="home" size={18} color="#4ECDC4" />
                <Text style={styles.statValue}>
                  {globalImpact.sheltersSupported}
                </Text>
                <Text style={styles.statLabel}>
                  {t("premium.sheltersSupported")}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="leaf" size={18} color="#66BB6A" />
                <Text style={styles.statValue}>
                  {globalImpact.conservationProjects}
                </Text>
                <Text style={styles.statLabel}>
                  {t("premium.projectsFunded")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Charity Partners */}
      {partners.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="handshake" size={20} color="#9C27B0" />
            <Text style={styles.sectionTitle}>{t("premium.ourPartners")}</Text>
          </View>

          <View style={styles.partnersContainer}>
            {partners.map((partner, index) => (
              <TouchableOpacity
                key={index}
                style={styles.partnerCard}
                onPress={() => openPartnerWebsite(partner.website)}
              >
                <View style={styles.partnerHeader}>
                  <Ionicons name="business" size={20} color="#9C27B0" />
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Ionicons name="open-outline" size={16} color="#7F8C8D" />
                </View>
                <Text style={styles.partnerDescription}>
                  {partner.description}
                </Text>
                <View style={styles.partnerLink}>
                  <Ionicons name="link" size={14} color="#4ECDC4" />
                  <Text style={styles.partnerLinkText}>{partner.website}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Footer Message */}
      <View style={styles.footer}>
        <Ionicons name="heart-circle" size={32} color="#FF6B6B" />
        <Text style={styles.footerTitle}>{t("premium.thankYou")}</Text>
        <Text style={styles.footerText}>
          {t("premium.premiumContributionMessage")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  impactCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  impactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  impactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  impactContent: {
    flex: 1,
  },
  impactValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
  },
  impactLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8F8F7",
    marginVertical: 16,
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#7F8C8D",
    marginTop: 4,
    textAlign: "center",
  },
  partnersContainer: {
    gap: 12,
  },
  partnerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8F8F7",
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    flex: 1,
  },
  partnerDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
    marginBottom: 8,
  },
  partnerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partnerLinkText: {
    fontSize: 12,
    color: "#4ECDC4",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 12,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 20,
  },
});
