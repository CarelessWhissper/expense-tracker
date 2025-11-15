import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { signUp } from "../../redux/authSlice";
const signUpSchema = z
  .object({
    name: z.string().min(2, "Naam moet minimaal 2 karakters bevatten"),
    email: z.string().email("Ongeldig e-mailadres"),
    password: z
      .string()
      .min(6, "Wachtwoord moet minimaal 6 karakters bevatten"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = () => {
    try {
      const validatedData = signUpSchema.parse(formData);
      dispatch(
        signUp({
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        })
      );

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});

      Toast.show({
        type: "success",
        text1: "Account succesvol aangemaakt!",
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};

        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignUpFormData] = err.message;
          }
        });

        setErrors(newErrors);

        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: error.errors[0].message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Iets is mis gegaan, probeer opnieuw",
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maak een account</Text>
      <Text style={styles.subtitle}>Welkom! Vul je gegevens hieronder in.</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Gebruiker Naam"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Password */}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Wachtwoord"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
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

      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Confirm Password */}

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Wachtwoord bevestigen"
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          secureTextEntry={!showConfirm}
        />

        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Ionicons
            name={showConfirm ? "eye-off" : "eye"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Account aanmaken</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
        <Text style={styles.link}>Heb je all een account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    maxWidth: 380,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    color: "#111",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },

  eyeButton: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  error: {
    color: "#d9534f",
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#377D22",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 18,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  link: {
    textAlign: "center",
    color: "#377D22",
    marginTop: 16,
  },
});
