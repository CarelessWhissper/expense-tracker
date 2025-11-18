import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { addToCurrentAmount, remove } from "../redux/savingsPlanSlice";

export default function SavingsPlanDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const savingsPlans = useSelector((state: any) => state.savingsPlans.plans);
  const mainSavingsPlan = savingsPlans[0] || null;

  const [addAmount, setAddAmount] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);

  if (!mainSavingsPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="savings" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Geen spaardoel gevonden</Text>
        </View>
      </View>
    );
  }

  const {
    id,
    goalName,
    amount,
    currentAmount,
    startDate,
    endDate,
  } = mainSavingsPlan;

  const progress = (currentAmount / amount) * 100;
  const remaining = amount - currentAmount;

  // Calculate time remaining
  const now = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = totalDays - daysRemaining;
  const timeProgress = (daysElapsed / totalDays) * 100;

  // Calculate suggested monthly savings
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const suggestedMonthlySavings = remaining / monthsRemaining;

  const handleAddMoney = () => {
    const amountToAdd = parseFloat(addAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      Alert.alert("Ongeldige invoer", "Voer een geldig bedrag in");
      return;
    }

    dispatch(addToCurrentAmount({ id, amount: amountToAdd }));
    setAddAmount("");
    setShowAddMoney(false);
    Alert.alert("Gelukt!", `€${amountToAdd.toFixed(2)} toegevoegd aan je spaardoel`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Spaardoel verwijderen",
      "Weet je zeker dat je dit spaardoel wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => {
            dispatch(remove(id));
            router.back();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <LinearGradient
           colors={["#377D22", "#2D5A5A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="savings" size={32} color="#fff" />
          </View>
          <Text style={styles.goalName}>{goalName}</Text>
          <Text style={styles.currentAmount}>€{currentAmount.toFixed(2)}</Text>
          <Text style={styles.targetAmount}>van €{amount.toFixed(2)}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(1)}% bereikt</Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="attach-money" size={24} color="#377D22" />
            <Text style={styles.statValue}>€{remaining.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Nog te gaan</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="event" size={24} color="#377D22" />
            <Text style={styles.statValue}>{daysRemaining}</Text>
            <Text style={styles.statLabel}>Dagen over</Text>
          </View>
        </View>

        {/* Suggestion Card */}
        <View style={styles.suggestionCard}>
          <MaterialIcons name="lightbulb-outline" size={24} color="#FFD700" />
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>Aanbevolen Maandelijks</Text>
            <Text style={styles.suggestionAmount}>
              €{suggestedMonthlySavings.toFixed(2)} per maand
            </Text>
            <Text style={styles.suggestionSubtext}>
              om je doel op tijd te bereiken
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Tijdlijn</Text>
          
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <MaterialIcons name="play-circle-outline" size={20} color="#377D22" />
              <Text style={styles.timelineLabel}>Start</Text>
              <Text style={styles.timelineDate}>{formatDate(startDate)}</Text>
            </View>
            
            <View style={styles.timelineProgressContainer}>
              <View style={styles.timelineProgressBar}>
                <View
                  style={[
                    styles.timelineProgress,
                    { width: `${timeProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.timelineProgressText}>
                {daysElapsed} / {totalDays} dagen
              </Text>
            </View>
            
            <View style={styles.timelineItem}>
              <MaterialIcons name="flag" size={20} color="#377D22" />
              <Text style={styles.timelineLabel}>Doel</Text>
              <Text style={styles.timelineDate}>{formatDate(endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!showAddMoney ? (
            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={() => setShowAddMoney(true)}
            >
              <MaterialIcons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addMoneyButtonText}>Geld Toevoegen</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addMoneyContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.euroSymbol}>€</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={addAmount}
                  onChangeText={setAddAmount}
                  autoFocus
                />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddMoney(false);
                    setAddAmount("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddMoney}
                >
                  <Text style={styles.confirmButtonText}>Bevestigen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Milestones (Future Feature) */}
        <View style={styles.milestonesCard}>
          <Text style={styles.sectionTitle}>Mijlpalen</Text>
          <View style={styles.milestone}>
            <View
              style={[
                styles.milestoneIndicator,
                progress >= 25 && styles.milestoneComplete,
              ]}
            >
              {progress >= 25 && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.milestoneText}>25% Bereikt</Text>
            {progress >= 25 && (
              <MaterialIcons name="emoji-events" size={20} color="#FFD700" />
            )}
          </View>
          
          <View style={styles.milestone}>
            <View
              style={[
                styles.milestoneIndicator,
                progress >= 50 && styles.milestoneComplete,
              ]}
            >
              {progress >= 50 && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.milestoneText}>50% Bereikt</Text>
            {progress >= 50 && (
              <MaterialIcons name="emoji-events" size={20} color="#FFD700" />
            )}
          </View>
          
          <View style={styles.milestone}>
            <View
              style={[
                styles.milestoneIndicator,
                progress >= 75 && styles.milestoneComplete,
              ]}
            >
              {progress >= 75 && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.milestoneText}>75% Bereikt</Text>
            {progress >= 75 && (
              <MaterialIcons name="emoji-events" size={20} color="#FFD700" />
            )}
          </View>
          
          <View style={styles.milestone}>
            <View
              style={[
                styles.milestoneIndicator,
                progress >= 100 && styles.milestoneComplete,
              ]}
            >
              {progress >= 100 && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.milestoneText}>100% Bereikt! 🎉</Text>
            {progress >= 100 && (
              <MaterialIcons name="emoji-events" size={20} color="#FFD700" />
            )}
          </View>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCard: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  goalName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  targetAmount: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  suggestionCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  suggestionAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#377D22",
    marginBottom: 2,
  },
  suggestionSubtext: {
    fontSize: 12,
    color: "#666",
  },
  timelineCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineItem: {
    alignItems: "center",
    gap: 4,
  },
  timelineLabel: {
    fontSize: 12,
    color: "#666",
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  timelineProgressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  timelineProgressBar: {
    height: 4,
    backgroundColor: "#E8F5E9",
    borderRadius: 2,
    overflow: "hidden",
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#377D22",
  },
  timelineProgressText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addMoneyButton: {
    flexDirection: "row",
    backgroundColor: "#377D22",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoneyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addMoneyContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 12,
  },
  euroSymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#377D22",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#377D22",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  milestonesCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  milestoneIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneComplete: {
    backgroundColor: "#377D22",
    borderColor: "#377D22",
  },
  milestoneText: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});