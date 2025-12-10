import { useAuth } from "@/contexts/auth-context";
import { registerService } from "@/lib/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated]);

  async function submitForm() {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Invalid Name", "Name must be at least 2 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const authData = await registerService({ name: name.trim(), email, password });
      await authLogin(authData);
      
      Alert.alert(
        "Welcome!",
        "Your account has been created successfully!",
        [
          {
            text: "Get Started",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
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
            <Text style={styles.appTitle}>Join Whingo</Text>
            <Text style={styles.appSubtitle}>Start your bird conservation journey</Text>
          </View>

          {/* Sign Up Form */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <FontAwesome6
                name="user"
                size={20}
                color="#95A5A6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#95A5A6"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6
                name="envelope"
                size={20}
                color="#95A5A6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
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
                placeholder="Password"
                placeholderTextColor="#95A5A6"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="password-new"
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
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
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
                • At least 6 characters
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={submitForm}
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
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/welcome" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 15,
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
    fontSize: 16,
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
    fontSize: 13,
    color: "#7F8C8D",
  },
  signupButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 13,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  termsLink: {
    color: "#4ECDC4",
    fontWeight: "600",
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
});
