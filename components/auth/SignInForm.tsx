// components/SignInForm.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { login } from "../../redux/authSlice";
import { useRouter } from "expo-router";
const signInSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});
type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const dispatch = useDispatch();
  const credentials = useSelector((state: any) => state.auth.credentials);
  const router = useRouter();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormData, string>>
  >({});
  const [loginError, setLoginError] = useState<string>("");

  const handleSignIn = () => {
    try {
      // Validate form data
      const validatedData = signInSchema.parse(formData);

      // Check if user exists in credentials
      const user = credentials.find(
        (cred: any) =>
          cred.email === validatedData.email &&
          cred.password === validatedData.password
      );

      if (user) {
        // Login successful - dispatch without password
        dispatch(
          login({
            email: user.email,
            name: user.name,
          })
        );

        setFormData({ email: "", password: "" });
        setErrors({});
        setLoginError("");

        onSuccess?.();
      } else {
        setLoginError("Ongeldig e-mailadres of wachtwoord");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignInFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignInFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {loginError && <Text style={styles.loginError}>{loginError}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Wachtwoord"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Nog geen account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
          <Text style={styles.link}>Registeer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 12,
  },
  loginError: {
    color: "red",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: "#ffe6e6",
    padding: 10,
    borderRadius: 8,
  },
  button: {
   backgroundColor: "#377D22",
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#377D22", 
    fontWeight: "600",
  },
});
