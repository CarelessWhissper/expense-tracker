
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, persistor } from "../redux/store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { scheduleReminderNotification } from "@/utils/reminderSchedule";
import { loadRemindersFromStorage } from "@/redux/remindersSlice";
import * as Notifications from "expo-notifications";


function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isNavigationReady, router]);

 
  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission not granted for notifications");
        return;
      }

      
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log("Expo Push Token:", token.data);
      } catch (error) {
        console.log("Push token error", error);
      }

      // Load reminders
      await dispatch(loadRemindersFromStorage());

      const state = store.getState().reminders;

      state.reminders.forEach((reminder) => {
        if (reminder.isActive) {
          scheduleReminderNotification(reminder, state.notificationTime);
        }
      });
    }

    setupNotifications();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}
