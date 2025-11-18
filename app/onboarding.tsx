import DateTimePicker from "@react-native-community/datetimepicker";
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
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [goalName, setGoalName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSkip = () => {
    // Mark onboarding as completed and navigate to home
    dispatch({ type: "auth/skipOnboarding" });
    router.replace("/(tabs)");
  };

  const handleSave = () => {
    if (!goalName || !amount) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
      });
      return;
    }

    // Save the savings plan (you'll need to create a Redux action for this)
    dispatch({
      type: "savingsPlans/add",
      payload: {
        id: Date.now().toString(),
        goalName,
        amount: parseFloat(amount),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      },
    });

    // Mark onboarding as completed
    dispatch({ type: "auth/completeOnboarding" });
    router.replace("/(tabs)");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Setting up Savings Plan</Text>
          <Text style={styles.subtitle}>
            Create your first savings goal to get started
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Emergency Fund"
              placeholderTextColor="#999"
              value={goalName}
              onChangeText={setGoalName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Savings Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9F2",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  footer: {
    gap: 12,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: "#377D22",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    padding: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
