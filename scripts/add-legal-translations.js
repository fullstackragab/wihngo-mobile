// Script to add legal section placeholders to all remaining language files
// This ensures all languages have the legal structure, even if using English text temporarily

const fs = require("fs");
const path = require("path");

const legalSectionEnglish = {
  lastUpdated: "Last updated: December 15, 2025",
  privacy: {
    intro:
      "Wihngo respects your privacy and is committed to protecting your personal data.",
    whoWeAre: "Who we are",
    whoWeAreContent:
      "Wihngo is a love-centric community platform for people who care about birds. The platform is operated in the European Union and is in the process of registration in Estonia.",
    whatDataWeCollect: "What data we collect",
    whatDataWeCollectIntro: "When you use the Wihngo app, we may collect:",
    dataAccountInfo: "Account information (name, email, password)",
    dataBirdInfo: "Bird information you share (species, name, photos, stories)",
    dataUserContent: "User-generated content (posts, comments, likes)",
    dataPaymentInfo: "Payment information for support transactions",
    dataTechnicalInfo: "Technical data (device type, OS version, IP address)",
    dataUsageInfo: "Usage data and analytics",
    whyWeCollectData: "Why we collect this data",
    whyWeCollectDataIntro: "We collect this data to:",
    reasonProvideService: "Provide and maintain the Wihngo service",
    reasonConnectUsers: "Connect people who care about birds",
    reasonProcessPayments: "Process support payments and donations",
    reasonImproveApp: "Improve app performance and user experience",
    reasonMaintainSecurity: "Maintain security and prevent fraud",
    legalBasis: "Legal basis",
    legalBasisContent:
      "Data is processed under the General Data Protection Regulation (GDPR) based on legitimate interest and contractual necessity.",
    dataSharing: "Data sharing",
    dataSharingContent:
      "We do not sell your data. Some data may be processed by trusted service providers (such as payment processors, cloud hosting, and analytics services). All providers are required to protect your data.",
    dataRetention: "Data retention",
    dataRetentionContent:
      "Data is kept only as long as necessary for the purposes described above, or as required by law.",
    yourRights: "Your rights",
    yourRightsContent:
      "Under GDPR, you have the right to access, correct, delete, or export your personal data. You can also object to processing or request restriction.",
    contact: "Contact",
    contactIntro:
      "For privacy-related questions or to exercise your rights, contact:",
    footer:
      "Wihngo is committed to transparency and protecting your personal information in accordance with EU data protection laws.",
  },
  terms: {
    intro: "By using the Wihngo app, you agree to the following terms.",
    platformRole: "Platform role",
    platformRoleContent:
      "Wihngo is a community platform. It is not a charity, financial institution, or veterinary service. We facilitate connections and support between bird lovers.",
    appUsage: "App usage",
    appUsageContent:
      "The Wihngo app is provided for connecting people who care about birds, sharing bird stories, and offering support. You must use the app responsibly and in accordance with these terms.",
    userContent: "User content",
    userContentContent:
      "Content you share on Wihngo (stories, photos, comments) remains your property. By posting content, you grant Wihngo a license to display and distribute it within the platform. You are responsible for the content you post.",
    communityGuidelines: "Community guidelines",
    communityGuidelinesIntro: "We expect all users to:",
    guidelineRespectful: "Be respectful and kind to others",
    guidelineAuthentic: "Share authentic stories about birds",
    guidelineResponsible: "Use the support features responsibly",
    guidelineNoHarm: "Not post harmful, offensive, or misleading content",
    supportAndPayments: "Support and payments",
    supportAndPaymentsContent:
      "Wihngo facilitates support payments between users. We are not responsible for the outcomes of these transactions. Users are responsible for providing accurate payment information and handling applicable taxes.",
    noGuarantees: "No guarantees",
    noGuaranteesContent:
      "Wihngo does not guarantee outcomes related to birds, stories, or support activities. All interactions and support are between users.",
    limitationOfLiability: "Limitation of liability",
    limitationOfLiabilityContent:
      "Wihngo is not responsible for any loss or damage arising from the use of the app. This includes, but is not limited to, financial losses, data loss, or any indirect damages.",
    accountTermination: "Account termination",
    accountTerminationContent:
      "Wihngo reserves the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.",
    governingLaw: "Governing law",
    governingLawContent:
      "These terms are governed by the laws of Estonia and the European Union.",
    changes: "Changes to terms",
    changesContent:
      "Wihngo may update these terms from time to time. We will notify users of significant changes through the app.",
    contact: "Contact",
    contactIntro: "For questions or support, contact:",
    footer:
      "Thank you for being part of the Wihngo community and caring about birds.",
  },
};

const settingsAdditions = {
  appSettings: "App Settings",
  theme: "Theme",
  support: "Support",
  helpSupport: "Help & Support",
  privacyPolicy: "Privacy Policy",
};

// Languages that still need the legal section
const languagesToUpdate = [
  "ar",
  "de",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "th",
  "tr",
  "vi",
  "zh",
];

const localesDir = path.join(__dirname, "..", "i18n", "locales");

console.log("Adding legal sections to remaining language files...\n");

languagesToUpdate.forEach((lang) => {
  const filePath = path.join(localesDir, `${lang}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);

      // Add missing settings fields
      if (data.settings) {
        data.settings = { ...data.settings, ...settingsAdditions };
      }

      // Add legal section
      if (!data.legal) {
        data.legal = legalSectionEnglish;
        console.log(`✓ Added legal section to ${lang}.json`);
      } else {
        console.log(`⊗ ${lang}.json already has legal section`);
      }

      // Write back
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
      console.error(`✗ Error processing ${lang}.json:`, error.message);
    }
  } else {
    console.error(`✗ File not found: ${filePath}`);
  }
});

console.log("\n✓ Done! Legal sections added with English text.");
console.log(
  "Note: Professional translations should be added for each language."
);
