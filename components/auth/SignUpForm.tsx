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

// schema

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
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

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
          text1: "Iets is miss gegaan, graag opnieuw proberen",
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registeren</Text>

      <TextInput
        style={styles.input}
        placeholder="Gebruiker Naam"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

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

      <TextInput
        style={styles.input}
        placeholder="Wachtwoord Bevestigen"
        value={formData.confirmPassword}
        onChangeText={(text) =>
          setFormData({ ...formData, confirmPassword: text })
        }
        secureTextEntry
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
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
});
