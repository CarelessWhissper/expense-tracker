import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SignInForm onSuccess={() => router.replace("/(tabs)")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f3f6f4",
  },
});
