import { StyleSheet, TextInput } from "react-native";

export default function RoundedTextInput(props: any) {
  return <TextInput style={styles.roundedInput} {...props} />;
}

const styles = StyleSheet.create({
  roundedInput: {
    borderWidth: 1, // Optional: Add a border for better visibility
    borderColor: "#ccc", // Optional: Set border color
    borderRadius: 10, // Adjust this value for desired roundness
    padding: 10, // Optional: Add padding inside the input,
    width: "80%",
    marginTop: 10,
  },
});
