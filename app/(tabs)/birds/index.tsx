import BirdList from "@/screens/bird-list";
import { Bird } from "@/types/bird";
import { router, Stack } from "expo-router";

export default function Birds() {
  return (
    <>
      <Stack.Screen options={{ title: "Birds", headerShown: false }} />
      <BirdList
        onPressBird={(bird: Bird) => {
          router.push(`/birds/${bird.birdId}`);
        }}
      />
    </>
  );
}
