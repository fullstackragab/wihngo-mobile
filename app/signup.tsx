import RoundedTextInput from "@/components/ui/rounded-text-input";
import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUp() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function submitForm() {
    // Add form submission logic here
    console.log({ firstname, lastname, email, password, confirmPassword });
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      extraScrollHeight={20} // Add extra space above the focused input
      enableOnAndroid={true} // Enable for Android devices
    >
      {" "}
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
          placeholder="Firstname"
          value={firstname}
          onChangeText={setFirstname}
        />
        <RoundedTextInput
          placeholder="Lastname"
          value={lastname}
          onChangeText={setLastname}
        />
        <RoundedTextInput
          placeholder="Email"
          required
          value={email}
          onChangeText={setEmail}
        />
        <RoundedTextInput
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <RoundedTextInput
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "60%",
            marginTop: 20,
          }}
        >
          <Button style={styles.roundedButton} onPressIn={submitForm}>
            Sign Up
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
