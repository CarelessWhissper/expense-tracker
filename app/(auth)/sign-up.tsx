import SignUpForm from "@/components/auth/SignUpForm";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SignUpForm onSuccess={() => router.push("/(auth)/sign-in")} />
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
