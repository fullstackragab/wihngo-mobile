import { Text, View } from "react-native";

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ textAlign: "center", marginTop: 32, fontSize: 18 }}>
        This is the profile screen.
      </Text>
    </View>
  );
}
