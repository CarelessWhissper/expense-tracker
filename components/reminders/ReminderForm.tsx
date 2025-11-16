import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function ReminderForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [date, setDate] = useState("");

  const handleSave = () => {
    if (!title || !amount || !frequency || !date) return;

    onSubmit({
      id: Date.now().toString(),
      title,
      amount,
      frequency,
      date,
    });

    setTitle("");
    setAmount("");
    setFrequency("");
    setDate("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder Title</Text>
      <TextInput
        placeholder="e.g. Save for iPhone"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        placeholder="e.g. 250"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <Text style={styles.label}>Frequency</Text>
      <TextInput
        placeholder="weekly / monthly"
        value={frequency}
        onChangeText={setFrequency}
        style={styles.input}
      />

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#3f51b5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
