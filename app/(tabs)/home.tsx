import { Text, View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ textAlign: "center", marginTop: 32, fontSize: 18 }}>
        This is the home screen.
      </Text>
    </View>
  );
}
