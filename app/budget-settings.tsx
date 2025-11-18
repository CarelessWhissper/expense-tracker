import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function BudgetSettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentBudget = useSelector((state: any) => state.budget.weeklyBudget);

  const [weeklyBudget, setWeeklyBudget] = useState(
    currentBudget ? currentBudget.toString() : ""
  );

  const handleSave = () => {
    const budgetAmount = parseFloat(weeklyBudget);

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert("Ongeldige invoer", "Voer een geldig budget bedrag in");
      return;
    }

    dispatch({
      type: "budget/setWeeklyBudget",
      payload: budgetAmount,
    });

    Alert.alert(
      "Budget Bijgewerkt",
      `Je weekbudget is ingesteld op SRD ${budgetAmount.toFixed(2)}`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const suggestedBudgets = [2000, 4000, 5000, 7000, 9000, 10000];

  const handleQuickSelect = (amount: number) => {
    setWeeklyBudget(amount.toString());
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Week Budget Instellen</Text>
          <Text style={styles.subtitle}>
            Stel je wekelijkse uitgavenlimiet in om je financiën bij te houden
          </Text>
        </View>

        {/* Current Budget Display */}
        {currentBudget > 0 && (
          <View style={styles.currentBudgetCard}>
            <MaterialIcons
              name="account-balance-wallet"
              size={32}
              color="#377D22"
            />
            <View style={styles.currentBudgetInfo}>
              <Text style={styles.currentBudgetLabel}>Huidig Week Budget</Text>
              <Text style={styles.currentBudgetAmount}>
                SRD {currentBudget.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Budget Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nieuw Week Budget</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.euroSymbol}>SRD </Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={weeklyBudget}
              onChangeText={setWeeklyBudget}
            />
            <Text style={styles.perWeek}>per week</Text>
          </View>
        </View>

        {/* Quick Select Buttons */}
        <View style={styles.quickSelectSection}>
          <Text style={styles.quickSelectTitle}>Snelle Selectie</Text>
          <View style={styles.quickSelectGrid}>
            {suggestedBudgets.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickSelectButton,
                  weeklyBudget === amount.toString() &&
                    styles.quickSelectButtonActive,
                ]}
                onPress={() => handleQuickSelect(amount)}
              >
                <Text
                  style={[
                    styles.quickSelectText,
                    weeklyBudget === amount.toString() &&
                      styles.quickSelectTextActive,
                  ]}
                >
                  SRD {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={24} color="#4ECDC4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Budget Tips</Text>
            <Text style={styles.infoText}>
              • Start met een realistisch budget{"\n"}• Bekijk je uitgaven van
              vorige weken{"\n"}• Pas je budget aan op basis van je behoeften
              {"\n"}• Laat ruimte voor onverwachte uitgaven
            </Text>
          </View>
        </View>

        {/* Monthly Equivalent */}
        {weeklyBudget && parseFloat(weeklyBudget) > 0 && (
          <View style={styles.equivalentCard}>
            <Text style={styles.equivalentLabel}>Maandelijks Equivalent</Text>
            <Text style={styles.equivalentAmount}>
              ≈ SRD {(parseFloat(weeklyBudget) * 4.33).toFixed(2)} per maand
            </Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>
            {currentBudget > 0 ? "Budget Bijwerken" : "Budget Instellen"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9F2",
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    lineHeight: 22,
  },
  currentBudgetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 16,
  },
  currentBudgetInfo: {
    flex: 1,
  },
  currentBudgetLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  currentBudgetAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#377D22",
  },
  inputSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#377D22",
    paddingHorizontal: 16,
  },
  euroSymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#377D22",
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  perWeek: {
    fontSize: 14,
    color: "#666",
  },
  quickSelectSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  quickSelectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickSelectButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 80,
    alignItems: "center",
  },
  quickSelectButtonActive: {
    backgroundColor: "#377D22",
    borderColor: "#377D22",
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  quickSelectTextActive: {
    color: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F9F9",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 20,
  },
  equivalentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  equivalentLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  equivalentAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#377D22",
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
