import { useNotifications } from "@/contexts/notification-context";
import { authService } from "@/lib/api/auth.service";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotifications();

  async function handleSubmit() {
    if (!email.trim()) {
      addNotification(
        "recommendation",
        t("forgotPassword.error"),
        t("forgotPassword.enterEmail")
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addNotification(
        "recommendation",
        t("forgotPassword.error"),
        t("forgotPassword.enterValidEmail")
      );
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email.trim());

      setIsSuccess(true);
      addNotification(
        "recommendation",
        t("forgotPassword.emailSent"),
        t("forgotPassword.emailSentMessage")
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("forgotPassword.sendFailed");
      addNotification(
        "recommendation",
        t("forgotPassword.error"),
        errorMessage
      );
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome6 name="arrow-left" size={20} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          {!isSuccess ? (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <FontAwesome6 name="lock" size={60} color="#4ECDC4" />
              </View>

              {/* Title */}
              <Text style={styles.title}>{t("forgotPassword.title")}</Text>
              <Text style={styles.subtitle}>
                {t("forgotPassword.subtitle")}
              </Text>

              {/* Email Input */}
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

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
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
                    <Text style={styles.buttonText}>
                      {t("forgotPassword.sendResetLink")}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkTextGray}>
                  {t("forgotPassword.rememberPassword")}{" "}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.linkText}>{t("welcome.signIn")}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <FontAwesome6 name="circle-check" size={80} color="#4ECDC4" />
              </View>

              {/* Success Message */}
              <Text style={styles.title}>{t("forgotPassword.checkEmail")}</Text>
              <Text style={styles.successText}>
                {t("forgotPassword.sentInstructions")}
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.successText}>
                {t("forgotPassword.linkExpires")}
              </Text>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>
                  {t("forgotPassword.nextSteps")}
                </Text>
                <Text style={styles.instructionsText}>
                  {t("forgotPassword.step1")}
                </Text>
                <Text style={styles.instructionsText}>
                  {t("forgotPassword.step2")}
                </Text>
                <Text style={styles.instructionsText}>
                  {t("forgotPassword.step3")}
                </Text>
              </View>

              {/* Resend Button */}
              <View style={styles.linkContainer}>
                <TouchableOpacity
                  onPress={() => setIsSuccess(false)}
                  style={styles.resendButton}
                >
                  <Text style={styles.linkText}>
                    {t("forgotPassword.didntReceive")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back to Login */}
              <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => router.replace("/welcome")}>
                  <Text style={styles.linkText}>
                    {t("forgotPassword.backToLogin")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
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
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  linkTextGray: {
    color: "#7F8C8D",
    fontSize: 13,
  },
  linkText: {
    color: "#4ECDC4",
    fontSize: 13,
    fontWeight: "bold",
  },
  successText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  instructionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
  },
});
