import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

export default function FAQ() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const faqSections: FAQSection[] = [
    {
      title: t("faq.payouts.title"),
      items: [
        {
          question: t("faq.payouts.whenDoIGetPaid"),
          answer: t("faq.payouts.whenDoIGetPaidAnswer"),
        },
        {
          question: t("faq.payouts.whyMinimum"),
          answer: t("faq.payouts.whyMinimumAnswer"),
        },
        {
          question: t("faq.payouts.whatIfNeverReach"),
          answer: t("faq.payouts.whatIfNeverReachAnswer"),
        },
        {
          question: t("faq.payouts.platformFee"),
          answer: t("faq.payouts.platformFeeAnswer"),
        },
        {
          question: t("faq.payouts.payoutMethods"),
          answer: t("faq.payouts.payoutMethodsAnswer"),
        },
      ],
    },
    {
      title: t("faq.support.title"),
      items: [
        {
          question: t("faq.support.howToSupport"),
          answer: t("faq.support.howToSupportAnswer"),
        },
        {
          question: t("faq.support.whatIsSupport"),
          answer: t("faq.support.whatIsSupportAnswer"),
        },
        {
          question: t("faq.support.canICancel"),
          answer: t("faq.support.canICancelAnswer"),
        },
      ],
    },
    {
      title: t("faq.crypto.title"),
      items: [
        {
          question: t("faq.crypto.whichCrypto"),
          answer: t("faq.crypto.whichCryptoAnswer"),
        },
        {
          question: t("faq.crypto.whySolana"),
          answer: t("faq.crypto.whySolanaAnswer"),
        },
        {
          question: t("faq.crypto.isCryptoSafe"),
          answer: t("faq.crypto.isCryptoSafeAnswer"),
        },
        {
          question: t("faq.crypto.wrongNetwork"),
          answer: t("faq.crypto.wrongNetworkAnswer"),
        },
        {
          question: t("faq.crypto.cryptoPayoutVolatility"),
          answer: t("faq.crypto.cryptoPayoutVolatilityAnswer"),
        },
      ],
    },
    {
      title: t("faq.account.title"),
      items: [
        {
          question: t("faq.account.howToDeleteAccount"),
          answer: t("faq.account.howToDeleteAccountAnswer"),
        },
        {
          question: t("faq.account.isDataSafe"),
          answer: t("faq.account.isDataSafeAnswer"),
        },
        {
          question: t("faq.account.canIChangeEmail"),
          answer: t("faq.account.canIChangeEmailAnswer"),
        },
      ],
    },
    {
      title: t("faq.legal.title"),
      items: [
        {
          question: t("faq.legal.isWihngoRegulated"),
          answer: t("faq.legal.isWihngoRegulatedAnswer"),
        },
        {
          question: t("faq.legal.taxResponsibility"),
          answer: t("faq.legal.taxResponsibilityAnswer"),
        },
        {
          question: t("faq.legal.whereIsWihngoRegistered"),
          answer: t("faq.legal.whereIsWihngoRegisteredAnswer"),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("faq.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.subtitle}>{t("faq.subtitle")}</Text>

        {faqSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => {
              const key = `${sectionIndex}-${itemIndex}`;
              const isExpanded = expandedItems.has(key);

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.faqItem}
                  onPress={() => toggleItem(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionRow}>
                    <Text style={styles.question}>{item.question}</Text>
                    <FontAwesome6
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#4ECDC4"
                    />
                  </View>
                  {isExpanded && (
                    <Text style={styles.answer}>{item.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
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
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
});
