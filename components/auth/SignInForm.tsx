// components/SignInForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { login } from "../../redux/authSlice";
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
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    try {
      const validatedData = signInSchema.parse(formData);

      const user = credentials.find(
        (cred: any) =>
          cred.email === validatedData.email &&
          cred.password === validatedData.password
      );

      if (user) {
        dispatch(login({ email: user.email, name: user.name }));
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Logo stays fixed at the top */}
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Image
          source={require("./miMoni-boBG.png")}
          resizeMode="contain"
          style={{ width: 220, height: 220 }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 140, // makes last input + button always scrollable
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error box */}
          {loginError !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{loginError}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Wachtwoord"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
          </View>

          {/* Sign in button */}
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Nog geen account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.link}>Registreer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 26,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },

  eyeButton: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 4,
  },

  inputGroup: {
    marginBottom: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e3e3e3",
    backgroundColor: "#fafafa",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  error: {
    color: "#d9534f",
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
  },

  errorBox: {
    backgroundColor: "#ffe8e8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#d9534f",
  },
  errorBoxText: {
    color: "#b52b27",
    textAlign: "center",
    fontSize: 14,
  },

  logo: {
    width: 350,
    height: 350,
    alignSelf: "center",
    // marginBottom: 20,
  },

  button: {
    backgroundColor: "#377D22",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  linkText: {
    fontSize: 15,
    color: "#666",
  },

  link: {
    fontSize: 15,
    color: "#377D22",
    fontWeight: "700",
  },
});
