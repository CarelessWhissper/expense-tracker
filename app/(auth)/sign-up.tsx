import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SignUpForm onSuccess={() => router.push("/(auth)/sign-in")} />

      <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
        <Text style={styles.link}>Heb je all een account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f3f6f4",
  },
  link: {
    textAlign: "center",
    color: "#377D22",
    marginTop: 16,
  },
});
