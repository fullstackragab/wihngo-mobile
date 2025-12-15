import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import id from "./locales/id.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import vi from "./locales/vi.json";
import zh from "./locales/zh.json";

const LANGUAGE_KEY = "@app_language";

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
  de: { translation: de },
  ar: { translation: ar },
  hi: { translation: hi },
  id: { translation: id },
  vi: { translation: vi },
  th: { translation: th },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
  it: { translation: it },
  tr: { translation: tr },
  pl: { translation: pl },
};

// Get saved language or use device language
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
      return savedLanguage;
    }

    // Get device locale
    const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";
    return resources[deviceLocale as keyof typeof resources]
      ? deviceLocale
      : "en";
  } catch {
    return "en";
  }
};

// Save language preference
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error("Error saving language:", error);
  }
};

// Initialize i18n
const initializeI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  // Set RTL based on initial language
  const shouldBeRTL = initialLanguage === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(shouldBeRTL);
    console.log("🔄 RTL initialized to:", shouldBeRTL);
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    compatibilityJSON: "v3",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

initializeI18n();

export default i18n;
