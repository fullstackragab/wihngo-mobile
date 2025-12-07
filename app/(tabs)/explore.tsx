import { data } from "@/data.js";
import { Button } from "@react-navigation/elements";
import * as Linking from "expo-linking";
import { Text, View } from "react-native";

export default function Explore() {
  async function support(item: any) {
    console.log("Supporting:", item);
    console.log("Opening PayPal link...");
    await Linking.openURL(`https://www.paypal.com/ncp/payment/QN482UZ3RTDKL`);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ textAlign: "center", marginTop: 32, fontSize: 18 }}>
        This is the explore screen.
      </Text>
      {data.map((item) => (
        <View key={item.id} style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 16 }}>{item.name}</Text>
          <Button onPress={() => support(item)}>Support {item.name}</Button>
        </View>
      ))}
    </View>
  );
}
