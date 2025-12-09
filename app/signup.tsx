import RoundedTextInput from "@/components/ui/rounded-text-input";
import { useAuth } from "@/contexts/auth-context";
import { registerService } from "@/lib/api";
import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const router = useRouter();

  async function submitForm() {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const authData = await registerService({ name, email, password });
      await authLogin(authData);

      console.log("Registration successful:", authData);
      Alert.alert("Success", "Account created successfully!");

      // Navigate to main app
      router.replace("/(tabs)/" as any);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      extraScrollHeight={20} // Add extra space above the focused input
      enableOnAndroid={true} // Enable for Android devices
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            textAlign: "center",
            marginTop: 32,
            marginBottom: 32,
            fontSize: 28,
            fontFamily: "Roboto",
            fontWeight: "bold",
          }}
        >
          Whingo
        </Text>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 200, height: 200 }}
        />
        <RoundedTextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
          autoCapitalize="words"
        />
        <RoundedTextInput
          placeholder="Email"
          required
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <RoundedTextInput
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
        <RoundedTextInput
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "60%",
            marginTop: 20,
          }}
        >
          <Button
            style={styles.roundedButton}
            onPressIn={submitForm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  roundedInput: {
    borderWidth: 1, // Optional: Add a border for better visibility
    borderColor: "#ccc", // Optional: Set border color
    borderRadius: 10, // Adjust this value for desired roundness
    padding: 10, // Optional: Add padding inside the input,
    width: "80%",
    marginTop: 10,
  },
  roundedButton: {
    borderRadius: 30, // Adjust this value for desired roundness
    padding: 10, // Optional: Add padding inside the button
    width: "80%",
    backgroundColor: "lightblue", // Optional: Set a background color
    margin: "auto",
  },
});
