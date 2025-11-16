import { Reminder } from "@/redux/remindersSlice";
import * as Notifications from "expo-notifications";

export async function scheduleReminderNotification(
  reminder: Reminder,
  notificationTime: string
) {
  if (!reminder.isActive) return;

  const [hour, minute] = notificationTime.split(":").map(Number);

  const dueDate = new Date(reminder.nextDueDate);
  dueDate.setDate(dueDate.getDate() - reminder.reminderDaysBefore);
  dueDate.setHours(hour, minute, 0);

  // If reminder is already passed → skip
  if (dueDate < new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body:
        reminder.type === "payment"
          ? "Your recurring payment is coming up."
          : "Time to contribute to your savings goal.",
      data: { id: reminder.id },
    },
    trigger: dueDate,
  });
}
