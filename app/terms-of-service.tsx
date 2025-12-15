import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TermsOfService() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings.termsOfService")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>{t("legal.lastUpdated")}</Text>

        <Text style={styles.paragraph}>{t("legal.terms.intro")}</Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.platformRole")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.platformRoleContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.appUsage")}</Text>
        <Text style={styles.paragraph}>{t("legal.terms.appUsageContent")}</Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.userContent")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.userContentContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.terms.communityGuidelines")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.communityGuidelinesIntro")}
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • {t("legal.terms.guidelineRespectful")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.terms.guidelineAuthentic")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.terms.guidelineResponsible")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.terms.guidelineNoHarm")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {t("legal.terms.supportAndPayments")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.supportAndPaymentsContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.noGuarantees")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.noGuaranteesContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.terms.limitationOfLiability")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.limitationOfLiabilityContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.terms.accountTermination")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.accountTerminationContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.governingLaw")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.terms.governingLawContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.changes")}</Text>
        <Text style={styles.paragraph}>{t("legal.terms.changesContent")}</Text>

        <Text style={styles.sectionTitle}>{t("legal.terms.contact")}</Text>
        <Text style={styles.paragraph}>{t("legal.terms.contactIntro")}</Text>
        <TouchableOpacity
          onPress={() => handleEmailPress("support@wihngo.com")}
        >
          <Text style={styles.link}>support@wihngo.com</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("legal.terms.footer")}</Text>
        </View>
      </ScrollView>
    </View>
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
  lastUpdated: {
    fontSize: 13,
    color: "#666",
    marginBottom: 24,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletList: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    marginBottom: 8,
  },
  link: {
    fontSize: 15,
    color: "#4ECDC4",
    textDecorationLine: "underline",
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
});
