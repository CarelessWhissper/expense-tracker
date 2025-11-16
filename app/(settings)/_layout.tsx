import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "Settings",
        headerStyle: {
          backgroundColor: "#F7F9FC",
        },
        headerTintColor: "#07101f",
        contentStyle: {
          backgroundColor: "#F7F9FC",
        },
      }}
    />
  );
}
