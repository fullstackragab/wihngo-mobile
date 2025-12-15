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

export default function PrivacyPolicy() {
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
        <Text style={styles.headerTitle}>{t("settings.privacyPolicy")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>{t("legal.lastUpdated")}</Text>

        <Text style={styles.paragraph}>{t("legal.privacy.intro")}</Text>

        <Text style={styles.sectionTitle}>{t("legal.privacy.whoWeAre")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.whoWeAreContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.privacy.whatDataWeCollect")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.whatDataWeCollectIntro")}
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • {t("legal.privacy.dataAccountInfo")}
          </Text>
          <Text style={styles.bullet}>• {t("legal.privacy.dataBirdInfo")}</Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.dataUserContent")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.dataPaymentInfo")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.dataTechnicalInfo")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.dataUsageInfo")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {t("legal.privacy.whyWeCollectData")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.whyWeCollectDataIntro")}
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • {t("legal.privacy.reasonProvideService")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.reasonConnectUsers")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.reasonProcessPayments")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.reasonImproveApp")}
          </Text>
          <Text style={styles.bullet}>
            • {t("legal.privacy.reasonMaintainSecurity")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t("legal.privacy.legalBasis")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.legalBasisContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.privacy.dataSharing")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.dataSharingContent")}
        </Text>

        <Text style={styles.sectionTitle}>
          {t("legal.privacy.dataRetention")}
        </Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.dataRetentionContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.privacy.yourRights")}</Text>
        <Text style={styles.paragraph}>
          {t("legal.privacy.yourRightsContent")}
        </Text>

        <Text style={styles.sectionTitle}>{t("legal.privacy.contact")}</Text>
        <Text style={styles.paragraph}>{t("legal.privacy.contactIntro")}</Text>
        <TouchableOpacity
          onPress={() => handleEmailPress("privacy@wihngo.com")}
        >
          <Text style={styles.link}>privacy@wihngo.com</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("legal.privacy.footer")}</Text>
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
