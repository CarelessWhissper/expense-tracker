import { financialTips } from "@/constants/financialTips";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { IconSymbol } from "../ui/icon-symbol";

export default function OverviewScreen() {
  const router = useRouter();

  const user = useSelector((state: any) => state.auth.user);
  const transactions = useSelector(
    (state: any) => state.transactions.transactions
  );
  const weeklyBudget = useSelector((state: any) => state.budget.weeklyBudget);
  const savingsPlans = useSelector((state: any) => state.savingsPlan.plans);

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % financialTips.length);
    }, 10 * 60 * 1000); // 10 minuten

    return () => clearInterval(interval);
  }, []);

  // Get the first/main savings plan
  const mainSavingsPlan = savingsPlans[0] || null;
  const savingsGoal = mainSavingsPlan?.amount || 0;
  const currentSavings = mainSavingsPlan?.currentAmount || 0;

  // Calculate insights
  const insights = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current week spending
    const currentWeekTransactions = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return tDate >= weekAgo && t.amount < 0;
    });

    const currentWeekSpent = currentWeekTransactions.reduce(
      (sum: number, t: any) => sum + Math.abs(t.amount),
      0
    );

    // Last week spending
    const lastWeekTransactions = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return tDate >= lastWeekStart && tDate < weekAgo && t.amount < 0;
    });

    const lastWeekSpent = lastWeekTransactions.reduce(
      (sum: number, t: any) => sum + Math.abs(t.amount),
      0
    );

    // Category breakdown (current week)
    const categorySpending: { [key: string]: number } = {};
    currentWeekTransactions.forEach((t: any) => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = 0;
      }
      categorySpending[t.category] += Math.abs(t.amount);
    });

    const topCategory = Object.entries(categorySpending).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];

    // Calculate percentage change
    const percentageChange =
      lastWeekSpent > 0
        ? ((currentWeekSpent - lastWeekSpent) / lastWeekSpent) * 100
        : 0;

    // Budget remaining
    const budgetRemaining = weeklyBudget - currentWeekSpent;
    const budgetPercentage = (currentWeekSpent / weeklyBudget) * 100;

    // Savings progress
    const savingsPercentage =
      savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;

    return {
      currentWeekSpent,
      lastWeekSpent,
      percentageChange,
      topCategory,
      budgetRemaining,
      budgetPercentage,
      savingsPercentage,
      categorySpending,
    };
  }, [transactions, weeklyBudget, savingsGoal, currentSavings]);

  // Generate AI nudge
  const generateNudge = () => {
    const { percentageChange, topCategory, budgetPercentage } = insights;

    if (budgetPercentage > 90) {
      return {
        type: "warning",
        message: `Je hebt al ${budgetPercentage.toFixed(
          0
        )}% van je weekbudget gebruikt!`,
        color: "#FF6B6B",
        icon: "warning" as const,
      };
    }

    if (percentageChange > 20) {
      return {
        type: "alert",
        message: `Je hebt deze week ${Math.abs(percentageChange).toFixed(
          0
        )}% meer uitgegeven dan vorige week`,
        color: "#FFA500",
        icon: "trending-up" as const,
      };
    }

    if (topCategory && topCategory[1] > 50) {
      return {
        type: "insight",
        message: `${
          topCategory[0]
        } is je grootste uitgave: €${topCategory[1].toFixed(2)}`,
        color: "#4ECDC4",
        icon: "insights" as const,
      };
    }

    return {
      type: "positive",
      message: `Goed bezig! Je blijft binnen je budget deze week`,
      color: "#95E1D3",
      icon: "check-circle" as const,
    };
  };

  const nudge =
    weeklyBudget > 0 && savingsPlans.length > 0 ? generateNudge() : null;

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  const renderTransactionIcon = (transaction: any) => {
    const { icon, iconType } = transaction;
    const iconProps = { size: 24, color: "#377D22" };

    switch (iconType) {
      case "MaterialIcons":
        return <MaterialIcons name={icon} {...iconProps} />;
      case "FontAwesome":
        return <FontAwesome name={icon} {...iconProps} />;
      case "Ionicons":
        return <Ionicons name={icon} {...iconProps} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={icon} {...iconProps} />;
      default:
        return <MaterialIcons name="receipt" {...iconProps} />;
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hallo, {user?.username || "User"}!
            </Text>
            <Text style={styles.subGreeting}>
              {new Date().toLocaleDateString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        </View>

        {/* AI Nudge Card */}
        {nudge && (
          <View style={[styles.nudgeCard, { borderLeftColor: nudge.color }]}>
            <Text style={styles.nudgeText}>{nudge.message}</Text>
            <MaterialIcons name={nudge.icon} size={24} color={nudge.color} />
          </View>
        )}

        {/* Budget Overview Card */}
        {weeklyBudget > 0 ? (
          <TouchableOpacity
            onPress={() => router.push("/budget-settings")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetCard}
            >
              <View style={styles.budgetHeader}>
                <View style={styles.budgetTitleRow}>
                  <Text style={styles.budgetLabel}>Week Budget</Text>
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
                <Text style={styles.budgetAmount}>
                  €{insights.budgetRemaining.toFixed(2)}
                </Text>
                <Text style={styles.budgetSubtext}>
                  van €{weeklyBudget.toFixed(2)} over
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(insights.budgetPercentage, 100)}%`,
                      backgroundColor:
                        insights.budgetPercentage > 90 ? "#FF6B6B" : "#95E1D3",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {insights.budgetPercentage.toFixed(0)}% gebruikt
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noBudgetCard}
            onPress={() => router.push("/budget-settings")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={32}
              color="#667eea"
            />
            <Text style={styles.noBudgetTitle}>Stel je weekbudget in</Text>
            <Text style={styles.noBudgetSubtitle}>
              Begin met het bijhouden van je uitgaven
            </Text>
          </TouchableOpacity>
        )}

        {/* Savings Goal Card - Dynamic based on savings plan */}
        {mainSavingsPlan ? (
          <TouchableOpacity
            style={styles.savingsCard}
            onPress={() => router.push("/savings-plan-details")}
          >
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsTitle}>
                <MaterialIcons name="savings" size={20} color="#377D22" />{" "}
                {mainSavingsPlan.goalName}
              </Text>
              <Text style={styles.savingsAmount}>
                €{currentSavings} / €{savingsGoal}
              </Text>
            </View>
            <View style={styles.savingsProgressContainer}>
              <View
                style={[
                  styles.savingsProgress,
                  { width: `${insights.savingsPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.savingsPercentage}>
              {insights.savingsPercentage.toFixed(0)}% bereikt
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noSavingsCard}
            onPress={() => router.push("/create-savings-plan")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={32}
              color="#377D22"
            />
            <Text style={styles.noSavingsTitle}>Maak je eerste spaardoel</Text>
            <Text style={styles.noSavingsSubtitle}>
              Begin met sparen voor je doelen
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="payments" size={24} color="#377D22" />
            <Text style={styles.statValue}>
              €{insights.currentWeekSpent.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Deze week</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons
              name={
                insights.percentageChange > 0 ? "trending-up" : "trending-down"
              }
              size={24}
              color={insights.percentageChange > 0 ? "#FF6B6B" : "#95E1D3"}
            />
            <Text
              style={[
                styles.statValue,
                {
                  color: insights.percentageChange > 0 ? "#FF6B6B" : "#95E1D3",
                },
              ]}
            >
              {insights.percentageChange > 0 ? "+" : ""}
              {insights.percentageChange.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>vs vorige week</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recente Transacties</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Bekijk alles</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((transaction: any) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.iconContainer}>
                  {renderTransactionIcon(transaction)}
                </View>
                <View>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {transaction.category}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.amount > 0 ? "#95E1D3" : "#2D3436",
                  },
                ]}
              >
                {transaction.amount > 0 ? "+" : ""}€
                {Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Micro-Saving Tip */}
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={24} color="#FFD700" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Spaar Tip van de Dag</Text>
            <Text style={styles.tipText}> {financialTips[tipIndex].text}</Text>
          </View>
        </View>
      </ScrollView>{" "}
      <Pressable
        style={styles.addTransaction}
        onPress={() => router.push("/(modals)/transactionModal")}
      >
        <IconSymbol size={38} name="plus.app.fill" color="white" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3436",
  },
  subGreeting: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 4,
  },
  nudgeCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nudgeText: {
    fontSize: 15,
    color: "#2D3436",
    fontWeight: "500",
  },
  budgetCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  budgetHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  budgetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFF",
  },
  budgetSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "right",
  },
  savingsCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    padding: "auto",
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
  savingsProgressContainer: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  savingsProgress: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 4,
  },
  savingsPercentage: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "right",
  },

  noSavingsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8F5E9",
    borderStyle: "dashed",
  },
  noSavingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 12,
  },
  noSavingsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noBudgetCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E4F3",
    borderStyle: "dashed",
  },
  noBudgetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 12,
  },
  noBudgetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
  },
  transactionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  seeAll: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
  },
  transactionCategory: {
    fontSize: 12,
    color: "#636E72",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tipCard: {
    backgroundColor: "#FFF9E6",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#FFE066",
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#636E72",
    lineHeight: 18,
  },
  addTransaction: {
    backgroundColor: "#377D22",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
    position: "absolute",
    bottom: 25,
    right: 35,
  },
});
