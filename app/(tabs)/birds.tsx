import BirdList from "@/screens/bird-list";
import { View } from "react-native";

export default function Birds() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <BirdList />
    </View>
  );
}
