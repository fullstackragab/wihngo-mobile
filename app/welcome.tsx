import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/contexts/notification-context";
import { loginService } from "@/lib/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const { login: authLogin, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated]);

  async function login() {
    if (!email || !password) {
      // Missing fields - user can see empty inputs
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Invalid email - user can see it's malformed
      return;
    }

    try {
      setIsLoading(true);
      const authData = await loginService({ email, password });
      await authLogin(authData);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("welcome.loginFailedMessage");
      addNotification("recommendation", t("welcome.loginFailed"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Image
              source={require("../assets/images/splash-icon.png")}
              style={styles.logo}
            />
            <Text style={styles.appTitle}>{t("welcome.appTitle")}</Text>
            <Text style={styles.appSubtitle}>{t("welcome.appSubtitle")}</Text>
            <Text style={styles.welcomeText}>{t("welcome.welcomeBack")}</Text>

            {/* Language Picker Button */}
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguagePicker(true)}
            >
              <FontAwesome6 name="globe" size={16} color="#4ECDC4" />
              <Text style={styles.languageButtonText}>
                {language === "en" && "English"}
                {language === "ar" && "العربية"}
                {language === "es" && "Español"}
                {language === "pt" && "Português"}
                {language === "fr" && "Français"}
                {language === "de" && "Deutsch"}
                {language === "hi" && "हिन्दी"}
                {language === "id" && "Bahasa Indonesia"}
                {language === "vi" && "Tiếng Việt"}
                {language === "th" && "ไทย"}
                {language === "ja" && "日本語"}
                {language === "ko" && "한국어"}
                {language === "zh" && "中文"}
                {language === "it" && "Italiano"}
                {language === "tr" && "Türkçe"}
                {language === "pl" && "Polski"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <FontAwesome6
                name="envelope"
                size={20}
                color="#95A5A6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("welcome.emailPlaceholder")}
                placeholderTextColor="#95A5A6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6
                name="lock"
                size={20}
                color="#95A5A6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("welcome.passwordPlaceholder")}
                placeholderTextColor="#95A5A6"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome6
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="#95A5A6"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>
                {t("welcome.forgotPassword")}
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={login}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {t("welcome.signIn")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t("welcome.noAccount")} </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>{t("welcome.signUp")}</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("chooseLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <FontAwesome6 name="xmark" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languageList}>
              {[
                { code: "en", name: "English" },
                { code: "ar", name: "العربية" },
                { code: "es", name: "Español" },
                { code: "pt", name: "Português" },
                { code: "fr", name: "Français" },
                { code: "de", name: "Deutsch" },
                { code: "hi", name: "हिन्दी" },
                { code: "id", name: "Bahasa Indonesia" },
                { code: "vi", name: "Tiếng Việt" },
                { code: "th", name: "ไทย" },
                { code: "ja", name: "日本語" },
                { code: "ko", name: "한국어" },
                { code: "zh", name: "中文" },
                { code: "it", name: "Italiano" },
                { code: "tr", name: "Türkçe" },
                { code: "pl", name: "Polski" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={async () => {
                    await setLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === lang.code && styles.languageOptionTextActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <FontAwesome6 name="check" size={20} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#34495E",
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    color: "#2C3E50",
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#4ECDC4",
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  signupText: {
    color: "#7F8C8D",
    fontSize: 13,
  },
  signupLink: {
    color: "#4ECDC4",
    fontSize: 13,
    fontWeight: "bold",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  languageButtonText: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  languageList: {
    padding: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  languageOptionActive: {
    backgroundColor: "#E8F5F4",
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  languageOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  languageOptionTextActive: {
    color: "#4ECDC4",
    fontWeight: "700",
  },
});
