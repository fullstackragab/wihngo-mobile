import { useNotifications } from "@/contexts/notification-context";
import { authService } from "@/lib/api/auth.service";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

export default function ResetPassword() {
  const { email, token } = useLocalSearchParams<{
    email: string;
    token: string;
  }>();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit() {
    // Validation
    if (!newPassword || !confirmPassword) {
      addNotification("recommendation", "Error", "Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      addNotification(
        "recommendation",
        "Error",
        "Password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      addNotification("recommendation", "Error", "Passwords do not match");
      return;
    }

    if (!email || !token) {
      addNotification("recommendation", "Error", "Invalid reset link");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(
        email as string,
        token as string,
        newPassword
      );

      setIsSuccess(true);
      addNotification(
        "recommendation",
        "Password Reset Successfully 🎉",
        "Your password has been changed. You can now log in with your new password."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace("/welcome");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset password";
      addNotification("recommendation", "Error", errorMessage);
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
          {!isSuccess ? (
            <>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require("../../assets/images/splash-icon.png")}
                  style={styles.logo}
                />
                <Text style={styles.appTitle}>Reset Password</Text>
                <Text style={styles.appSubtitle}>
                  Enter your new password to continue
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <FontAwesome6
                    name="lock"
                    size={20}
                    color="#95A5A6"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#95A5A6"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <FontAwesome6
                    name="lock"
                    size={20}
                    color="#95A5A6"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#95A5A6"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <FontAwesome6
                      name={showConfirmPassword ? "eye-slash" : "eye"}
                      size={20}
                      color="#95A5A6"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Requirements */}
                <View style={styles.passwordHints}>
                  <Text style={styles.passwordHintText}>
                    • At least 8 characters
                  </Text>
                  <Text style={styles.passwordHintText}>
                    • Include uppercase, lowercase, number & special character
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    isLoading && styles.resetButtonDisabled,
                  ]}
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
                      <Text style={styles.resetButtonText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back to Login */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => router.replace("/welcome")}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Image
                source={require("../../assets/images/splash-icon.png")}
                style={styles.logo}
              />
              {/* Success Icon */}
              <FontAwesome6
                name="circle-check"
                size={60}
                color="#4ECDC4"
                style={styles.successIcon}
              />

              {/* Success Message */}
              <Text style={styles.appTitle}>Password Reset! 🎉</Text>
              <Text style={styles.appSubtitle}>
                Your password has been changed successfully.
              </Text>
              <Text style={styles.appSubtitle}>Redirecting to login...</Text>
            </View>
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
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    textAlign: "center",
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
  passwordHints: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  passwordHintText: {
    fontSize: 11,
    color: "#7F8C8D",
  },
  resetButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#7F8C8D",
    fontSize: 15,
  },
  loginLink: {
    color: "#4ECDC4",
    fontSize: 15,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 40,
  },
  successIcon: {
    marginVertical: 24,
  },
});
