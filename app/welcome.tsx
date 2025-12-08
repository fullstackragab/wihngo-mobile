import RoundedTextInput from "@/components/ui/rounded-text-input";
import { useAuth } from "@/contexts/auth-context";
import { loginService } from "@/services/auth.service";
import { Button } from "@react-navigation/elements";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const router = useRouter();

  async function login() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      const authData = await loginService({ email, password });
      await authLogin(authData);

      console.log("Login successful:", authData);
      Alert.alert("Success", "Login successful!");

      // Navigate to main app
      router.replace("/(tabs)/home" as any);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text
        style={{
          textAlign: "center",
          marginTop: 32,
          fontSize: 46,
          fontFamily: "Roboto",
          fontWeight: "bold",
          marginBottom: 6,
        }}
      >
        Whingo
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          fontFamily: "Roboto",
          marginBottom: 6,
        }}
      >
        Where Hearts & Wings Gather
      </Text>
      <Image
        source={require("../assets/images/splash-icon.png")}
        style={{ width: 200, height: 200 }}
      />
      <RoundedTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <RoundedTextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
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
        <Link href="/home">
          <Text style={{ marginTop: 20, color: "blue" }}>Profile</Text>
        </Link>
        <Button
          style={styles.roundedButton}
          onPressIn={login}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Login"}
        </Button>
      </View>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={{ marginTop: 20 }}>Don&apos;t have an account?</Text>
        <Pressable onPress={() => {}}>
          <Link href="/signup">
            <Text style={{ marginTop: 20, color: "blue" }}>Sign Up</Text>
          </Link>
        </Pressable>
      </View>
      <Link href="/(tabs)/home">
        <Text style={{ marginTop: 20, color: "blue" }}>Start</Text>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  roundedButton: {
    borderRadius: 30, // Adjust this value for desired roundness
    padding: 10, // Optional: Add padding inside the button
    width: "80%",
    backgroundColor: "lightblue", // Optional: Set a background color
    margin: "auto",
  },
});
