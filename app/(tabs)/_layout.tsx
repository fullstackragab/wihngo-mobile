import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, Pressable } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="compass" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="add" size={30} color={color} />
          ),
          tabBarButton: (props) => (
            <Pressable
              style={({ pressed }) => {
                const theme = Colors[colorScheme ?? "light"];
                const blendWithWhite = (hex: string, amount = 0.25) => {
                  try {
                    if (!hex || hex[0] !== "#") return hex;
                    const h = hex.slice(1);
                    const r = parseInt(h.slice(0, 2), 16);
                    const g = parseInt(h.slice(2, 4), 16);
                    const b = parseInt(h.slice(4, 6), 16);
                    const blend = (c: number) =>
                      Math.round(c + (255 - c) * amount);
                    return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
                  } catch {
                    return hex;
                  }
                };

                const backgroundColor =
                  pressed && Platform.OS !== "web"
                    ? blendWithWhite(theme.tint, 0.35)
                    : theme.background;

                return [
                  {
                    top: -20,
                    paddingTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    width: 70,
                    height: 70,
                    borderRadius: 50,
                    backgroundColor,
                    shadowColor: "black",
                    shadowOffset: {
                      width: 0,
                      height: 8,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 5,
                  },
                ];
              }}
              onPress={props.onPress}
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="bell" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
