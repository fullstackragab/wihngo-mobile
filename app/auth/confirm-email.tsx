import { useNotifications } from "@/contexts/notification-context";
import { authService } from "@/lib/api/auth.service";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmEmail() {
  const { email, token } = useLocalSearchParams<{
    email: string;
    token: string;
  }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (email && token) {
      confirmEmailWithToken();
    } else {
      setError("Invalid confirmation link. Missing email or token.");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token]);

  async function confirmEmailWithToken() {
    try {
      setIsLoading(true);
      setError(null);

      await authService.confirmEmail(email as string, token as string);

      setIsSuccess(true);
      addNotification(
        "recommendation",
        "Email Confirmed! 🎉",
        "Your email has been successfully confirmed. You can now log in."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace("/welcome");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to confirm email";
      setError(errorMessage);
      console.error("Email confirmation error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email) return;

    try {
      setIsResending(true);
      await authService.resendConfirmation(email as string);

      addNotification(
        "recommendation",
        "Email Sent",
        "A new confirmation email has been sent. Please check your inbox."
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend confirmation";
      addNotification("recommendation", "Error", errorMessage);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4ECDC4", "#44A08D"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.title}>Confirming your email...</Text>
              <Text style={styles.subtitle}>Please wait a moment</Text>
            </>
          ) : isSuccess ? (
            <>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="circle-check" size={80} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Email Confirmed! 🎉</Text>
              <Text style={styles.subtitle}>
                Your email has been successfully confirmed.
              </Text>
              <Text style={styles.subtitle}>Redirecting to login...</Text>
            </>
          ) : error ? (
            <>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="circle-xmark" size={80} color="#FF6B6B" />
              </View>
              <Text style={styles.title}>Confirmation Failed</Text>
              <Text style={styles.errorText}>{error}</Text>

              {email && error.includes("expired") && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleResendConfirmation}
                  disabled={isResending}
                >
                  {isResending ? (
                    <ActivityIndicator color="#4ECDC4" />
                  ) : (
                    <>
                      <FontAwesome6
                        name="envelope"
                        size={18}
                        color="#4ECDC4"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>
                        Resend Confirmation Email
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.replace("/welcome")}
              >
                <Text style={styles.secondaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.9,
  },
  errorText: {
    fontSize: 16,
    color: "#FFE5E5",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minWidth: 250,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
