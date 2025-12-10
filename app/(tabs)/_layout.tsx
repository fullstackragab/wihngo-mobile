import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { NotificationBell } from "@/components/notification-bell";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerRight: () => <NotificationBell />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={20} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="users" size={20} color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="stories"
        options={{
          title: "Stories",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="post" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="birds"
        options={{
          title: "Birds",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("@/assets/images/birds.png")}
              style={{ width: 30, height: 30 }}
            />
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
