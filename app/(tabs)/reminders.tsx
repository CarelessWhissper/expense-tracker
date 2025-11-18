import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { Reminder } from "../../redux/remindersSlice";
import { deleteReminder, markAsPaid } from "../../redux/remindersSlice";

export default function RemindersScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const reminders = useSelector((state: any) => state.reminders.reminders);

  // Sort reminders: unpaid first, then by date
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a: Reminder, b: Reminder) => {
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [reminders]);

  // Separate upcoming and paid reminders
  const upcomingReminders = sortedReminders.filter((r: Reminder) => !r.isPaid);
  const paidReminders = sortedReminders.filter((r: Reminder) => r.isPaid);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Vandaag";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Morgen";
    }

    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRecurringText = (reminder: Reminder) => {
    if (!reminder.isRecurring) return null;

    const typeMap = {
      daily: "Dagelijks",
      weekly: "Wekelijks",
      monthly: "Maandelijks",
      yearly: "Jaarlijks",
    };

    return typeMap[reminder.recurringType || "monthly"];
  };

  const handleMarkAsPaid = (id: string, title: string) => {
    Alert.alert("Betaling Bevestigen", `Markeer "${title}" als betaald?`, [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Betaald",
        onPress: () => dispatch(markAsPaid(id)),
      },
    ]);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Herinnering Verwijderen",
      `Weet je zeker dat je "${title}" wilt verwijderen?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => dispatch(deleteReminder(id)),
        },
      ]
    );
  };

  const renderReminderCard = (reminder: Reminder) => {
    const daysUntil = getDaysUntil(reminder.dueDate);
    const isOverdue = daysUntil < 0;
    const isDueSoon = daysUntil >= 0 && daysUntil <= 3;

    return (
      <View
        key={reminder.id}
        style={[
          styles.reminderCard,
          reminder.isPaid && styles.reminderCardPaid,
          isOverdue && !reminder.isPaid && styles.reminderCardOverdue,
        ]}
      >
        <View style={styles.reminderLeft}>
          <View
            style={[
              styles.iconContainer,
              reminder.isPaid && styles.iconContainerPaid,
              isOverdue && !reminder.isPaid && styles.iconContainerOverdue,
            ]}
          >
            <MaterialIcons
              name={
                reminder.isPaid
                  ? "check-circle"
                  : reminder.isRecurring
                  ? "repeat"
                  : "notifications-active"
              }
              size={24}
              color={
                reminder.isPaid ? "#95E1D3" : isOverdue ? "#FF6B6B" : "#377D22"
              }
            />
          </View>

          <View style={styles.reminderInfo}>
            <Text
              style={[
                styles.reminderTitle,
                reminder.isPaid && styles.reminderTitlePaid,
              ]}
            >
              {reminder.title}
            </Text>
            <View style={styles.reminderMeta}>
              <Text style={styles.reminderDate}>
                {formatDate(reminder.dueDate)}
              </Text>
              {reminder.isRecurring && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.recurringBadge}>
                    {getRecurringText(reminder)}
                  </Text>
                </>
              )}
            </View>
            {reminder.category && (
              <Text style={styles.reminderCategory}>{reminder.category}</Text>
            )}
          </View>
        </View>

        <View style={styles.reminderRight}>
          <Text
            style={[
              styles.reminderAmount,
              reminder.isPaid && styles.reminderAmountPaid,
            ]}
          >
            SRD {reminder.amount.toFixed(2)}
          </Text>

          {!reminder.isPaid && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => handleMarkAsPaid(reminder.id, reminder.title)}
              >
                <MaterialIcons name="check" size={20} color="#377D22" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(reminder.id, reminder.title)}
              >
                <MaterialIcons name="close" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isOverdue && !reminder.isPaid && (
          <View style={styles.overdueTag}>
            <MaterialIcons name="warning" size={14} color="#fff" />
            <Text style={styles.overdueText}>Te laat</Text>
          </View>
        )}

        {isDueSoon && !reminder.isPaid && (
          <View style={styles.dueSoonTag}>
            <MaterialIcons name="schedule" size={14} color="#fff" />
            <Text style={styles.dueSoonText}>{daysUntil}d</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Betalingsherinneringen</Text>
          <Text style={styles.subtitle}>
            {upcomingReminders.length} openstaand
            {upcomingReminders.length !== 1 ? "e" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(reminders)/create-reminders")}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Openstaand</Text>
            {upcomingReminders.map(renderReminderCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Geen openstaande betalingen</Text>
            <Text style={styles.emptySubtitle}>
              Voeg je eerste herinnering toe
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(reminders)/create-reminders")}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Herinnering Toevoegen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Paid Reminders */}
        {paidReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Betaald</Text>
            {paidReminders.map(renderReminderCard)}
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#377D22",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  reminderCardPaid: {
    opacity: 0.6,
  },
  reminderCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  reminderLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerPaid: {
    backgroundColor: "#E8F5E9",
  },
  iconContainerOverdue: {
    backgroundColor: "#FFE8E8",
  },
  reminderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  reminderTitlePaid: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  reminderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  reminderDate: {
    fontSize: 13,
    color: "#666",
  },
  metaDot: {
    fontSize: 13,
    color: "#ccc",
  },
  recurringBadge: {
    fontSize: 12,
    color: "#377D22",
    fontWeight: "500",
  },
  reminderCategory: {
    fontSize: 12,
    color: "#999",
  },
  reminderRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  reminderAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  reminderAmountPaid: {
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  overdueTag: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  dueSoonTag: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dueSoonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: "#377D22",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
