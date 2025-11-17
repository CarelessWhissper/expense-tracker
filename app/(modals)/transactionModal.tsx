import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid number")
    .transform(Number)
    .refine((v) => v > 0, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export default function TransactionModal() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function pickReceipt() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setReceipt(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    const result = TransactionSchema.safeParse({
      type,
      amount,
      category,
      description,
      merchant: type === "expense" ? merchant : undefined,
      paymentMethod: type === "expense" ? paymentMethod : undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const formData = {
      ...result.data,
      receipt: type === "expense" ? receipt : null,
    };
    console.log("FORM SUBMITTED:", formData);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setType("income")}
          style={[styles.toggle, type === "income" && styles.toggleActive]}
        >
          <Text
            style={[styles.toggleText, type === "income" && styles.activeText]}
          >
            Income
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setType("expense")}
          style={[styles.toggle, type === "expense" && styles.toggleActive]}
        >
          <Text
            style={[styles.toggleText, type === "expense" && styles.activeText]}
          >
            Expense
          </Text>
        </Pressable>
      </View>

      {/* Amount */}
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={[styles.input, errors.amount && styles.inputError]}
        placeholder="0.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <TextInput
        style={[styles.input, errors.category && styles.inputError]}
        placeholder="Food, Rent, Salary..."
        value={category}
        onChangeText={setCategory}
      />
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Optional"
        value={description}
        onChangeText={setDescription}
      />

      {type === "expense" && (
        <>
          {/* Merchant */}
          <Text style={styles.label}>Merchant / Shop</Text>
          <TextInput
            style={styles.input}
            placeholder="Where did you spend?"
            value={merchant}
            onChangeText={setMerchant}
          />

          {/* Receipt */}
          <Pressable style={styles.uploadButton} onPress={pickReceipt}>
            <Text style={styles.uploadText}>
              {receipt ? "Change Receipt" : "Upload Receipt"}
            </Text>
          </Pressable>
          {receipt && (
            <Image
              source={{ uri: receipt }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 10,
                marginTop: 10,
              }}
            />
          )}
        </>
      )}

      {/* Submit */}
      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Transaction</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FDF9F2",
    gap: 12,
    paddingBottom: 80,
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#377D22",
  },
  toggleText: {
    color: "#555",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  uploadButton: {
    marginTop: 10,
    backgroundColor: "#377D22",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "white",
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: "#377D22",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
