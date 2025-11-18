import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { addReminder } from "../../redux/remindersSlice";

const CATEGORIES = [
  "Huur",
  "Utilities",
  "Internet",
  "Telefoon",
  "Gym",
  "Verzekering",
  "Abonnement",
  "Anders",
];

const RECURRING_TYPES = [
  { label: "Dagelijks", value: "daily" },
  { label: "Wekelijks", value: "weekly" },
  { label: "Maandelijks", value: "monthly" },
  { label: "Jaarlijks", value: "yearly" },
];

export default function CreateReminderScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Fout", "Voer een titel in");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Fout", "Voer een geldig bedrag in");
      return;
    }

    dispatch(
      addReminder({
        id: Date.now().toString(),
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        dueDate: dueDate.toISOString(),
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
        isPaid: false,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      })
    );

    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Nieuwe Herinnering</Text>
        </View>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. Gym Lidmaatschap"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bedrag *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>SRD </Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categorie</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vervaldatum</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Recurring Toggle */}
          <View style={styles.switchGroup}>
            <View style={styles.switchLeft}>
              <MaterialIcons name="repeat" size={24} color="#377D22" />
              <View>
                <Text style={styles.switchLabel}>Terugkerend</Text>
                <Text style={styles.switchSubtext}>Automatisch herhalen</Text>
              </View>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#E0E0E0", true: "#95E1D3" }}
              thumbColor={isRecurring ? "#377D22" : "#f4f3f4"}
            />
          </View>

          {/* Recurring Type */}
          {isRecurring && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequentie</Text>
              <View style={styles.recurringGrid}>
                {RECURRING_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.recurringButton,
                      recurringType === type.value &&
                        styles.recurringButtonActive,
                    ]}
                    onPress={() =>
                      setRecurringType(
                        type.value as "daily" | "weekly" | "monthly" | "yearly"
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.recurringButtonText,
                        recurringType === type.value &&
                          styles.recurringButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notities (optioneel)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Voeg notities toe..."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialIcons name="check" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Herinnering Opslaan</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  form: {
    padding: 20,
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
  notesInput: {
    minHeight: 80,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#377D22",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 16,
    color: "#1a1a1a",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryButtonActive: {
    backgroundColor: "#377D22",
    borderColor: "#377D22",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  switchSubtext: {
    fontSize: 12,
    color: "#666",
  },
  recurringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recurringButton: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  recurringButtonActive: {
    backgroundColor: "#377D22",
    borderColor: "#377D22",
  },
  recurringButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  recurringButtonTextActive: {
    color: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#377D22",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
