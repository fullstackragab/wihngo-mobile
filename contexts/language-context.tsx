import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, I18nManager } from "react-native";
import { saveLanguage } from "../i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log("🔄 i18n language changed event:", lng);
      setLanguageState(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const setLanguage = async (lang: string) => {
    try {
      console.log("🌐 Changing language to:", lang);
      console.log("🌐 Current i18n language:", i18n.language);

      await i18n.changeLanguage(lang);
      console.log(
        "✅ i18n.changeLanguage completed, new language:",
        i18n.language
      );

      await saveLanguage(lang);
      console.log("✅ Language saved to AsyncStorage");

      setLanguageState(lang);
      console.log("✅ Language state updated");

      // Check if RTL needs to be toggled
      const shouldBeRTL = lang === "ar";
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
        setIsRTL(shouldBeRTL);
        console.log("✅ RTL toggled to:", shouldBeRTL);

        // Notify user to restart app for RTL changes
        Alert.alert(
          "Language Changed",
          "Please restart the app to apply the new language layout.",
          [{ text: "OK" }]
        );
      } else {
        setIsRTL(shouldBeRTL);
        console.log("✅ RTL state updated without restart:", shouldBeRTL);
      }
    } catch (error) {
      console.error("❌ Error changing language:", error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
