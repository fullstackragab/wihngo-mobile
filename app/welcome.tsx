import RoundedTextInput from "@/components/ui/rounded-text-input";
import { loginService } from "@/services/login.service";
import { Button } from "@react-navigation/elements";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    loginService(email, password)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Login failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Login successful:", data);
        // Handle successful login, e.g., navigate to the main app screen
      })
      .catch((error) => {
        console.error("Login error:", error);
        // Handle login error, e.g., show an error message to the user
      });
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
      />
      <RoundedTextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "60%",
          marginTop: 20,
        }}
      >
        <Button style={styles.roundedButton} onPressIn={login}>
          Login
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
      <Link href="/(tabs)">
        <Text style={{ marginTop: 20, color: "blue" }}>Start</Text>
      </Link>
    </View>
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
