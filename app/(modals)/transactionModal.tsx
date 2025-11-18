import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { addTransaction, scanTransaction } from "@/redux/transactionsSlice";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
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
  const [isScanning, setIsScanning] = useState(false); // Local scanning state
  
  const dispatch = useAppDispatch();
  const { scanError } = useAppSelector((state) => state.transactions);

  async function pickReceipt() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setReceipt(asset.uri);
      
      // Auto-scan when receipt is selected
      if (type === "expense" && asset.base64) {
        await handleScanReceipt(asset.base64, asset.uri);
      }
    }
  }

  async function takePicture() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Camera permission required",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setReceipt(asset.uri);
      
      // Auto-scan when picture is taken
      if (type === "expense" && asset.base64) {
        await handleScanReceipt(asset.base64, asset.uri);
      }
    }
  }

  async function handleScanReceipt(base64: string, uri: string) {
    setIsScanning(true);
    
    try {
      const fileName = uri.split("/").pop() || "receipt.jpg";
      const filetype = fileName.split(".").pop() === "png" ? "png" : "jpeg";
      
      // Add timeout to the scan request
      const scanPromise = dispatch(scanTransaction({
        baseEnc: base64,
        fileName,
        filetype,
      })).unwrap();

      // Set 30 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Scan timeout - please try again")), 30000)
      );

      const result = await Promise.race([scanPromise, timeoutPromise]) as any;
      
      // Auto-fill form with scanned data
      const scanResult = result.rspObject.result;
      setAmount(scanResult.total.toString());
      setMerchant(scanResult.merchant.name);
      setDescription(`Receipt ${scanResult.receiptId}`);
      setCategory("Shopping"); // Default category
      
      Toast.show({
        type: "success",
        text1: "Receipt scanned successfully!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scan failed";
      Toast.show({
        type: "error",
        text1: "Scan failed",
        text2: errorMessage,
      });
    } finally {
      setIsScanning(false);
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

    const formDataFinal = {
      id: Math.random().toString(36).substr(2, 9),
      amount: type === "expense" ? -result.data.amount : result.data.amount,
      category: result.data.category,
      description: result.data.description || "",
      date: new Date().toISOString(),
      icon: "attach-money",
      iconType: "MaterialIcons",
      receipt: type === "expense" ? receipt : null,
      merchant: type === "expense" ? result.data.merchant : undefined,
    };

    dispatch(addTransaction(formDataFinal));

    Toast.show({
      type: "success",
      text1: "Transaction saved!",
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setMerchant("");
    setPaymentMethod("");
    setReceipt(null);
  }

  const isLoading = isScanning; 

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

          {/* Receipt Section */}
          <Text style={styles.label}>Receipt</Text>
          <View style={styles.receiptButtons}>
            <Pressable 
              style={[styles.uploadButton, styles.receiptButton]} 
              onPress={pickReceipt}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.uploadText}>
                  {receipt ? "Change Receipt" : "Upload Receipt"}
                </Text>
              )}
            </Pressable>
            
            <Pressable 
              style={[styles.uploadButton, styles.cameraButton]} 
              onPress={takePicture}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.uploadText}>Take Picture</Text>
              )}
            </Pressable>
          </View>
          
          {scanError && (
            <Text style={styles.errorText}>Scan failed: {scanError}</Text>
          )}
          
          {/* Show receipt preview only when not scanning */}
          {receipt && !isLoading && (
            <Image
              source={{ uri: receipt }}
              style={styles.receiptImage}
            />
          )}
          
          {/* Show scanning indicator */}
          {isLoading && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#377D22" />
              <Text style={styles.scanningText}>Scanning receipt...</Text>
              <Text style={styles.scanningSubtext}>This may take a few seconds</Text>
            </View>
          )}
        </>
      )}

      {/* Submit */}
      <Pressable 
        style={[styles.submitBtn, (isLoading) && styles.submitBtnDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>Save Transaction</Text>
        )}
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
  receiptButtons: {
    flexDirection: "row",
    gap: 12,
  },
  receiptButton: {
    flex: 1,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: "#2D5A5A",
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
  receiptImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  scanningContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  scanningText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  scanningSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: "#377D22",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#999",
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});