import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#377D22", // green
        tabBarInactiveTintColor: "#999", // gray
        tabBarStyle: {
          backgroundColor: "#FDF9F2", // beige/white
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          headerShown: true, 
          headerStyle: { backgroundColor: "#F7F9FC" },
          headerTintColor: "#07101f",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gearshape.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
