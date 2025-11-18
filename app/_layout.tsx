// app/_layout.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import Toast from 'react-native-toast-message';
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../redux/store";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  const hasCompletedOnboarding = useSelector(
    (state: any) => state.auth.hasCompletedOnboarding
  );

  useEffect(() => {
    // Mark navigation as ready after first render
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
      // Redirect to onboarding if authenticated but hasn't completed onboarding
      router.replace("/onboarding");
    } else if (
      isAuthenticated &&
      hasCompletedOnboarding &&
      (inAuthGroup || inOnboarding)
    ) {
      // Redirect to tabs if authenticated and completed onboarding
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments, isNavigationReady, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
        <Toast />
      </PersistGate>
    </Provider>
  );
}
