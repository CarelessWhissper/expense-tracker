import { Reminder } from "@/redux/remindersSlice";
import { markAsPaid } from "@/redux/remindersSlice";

export function checkDueReminders(reminders: Reminder[], dispatch: any) {
  const today = new Date();

  reminders.forEach((reminder) => {
    if (!reminder.isActive) return;

    const nextDue = new Date(reminder.nextDueDate);

    // If today is the next due date
    if (
      nextDue.getDate() === today.getDate() &&
      nextDue.getMonth() === today.getMonth() &&
      nextDue.getFullYear() === today.getFullYear()
    ) {
      dispatch(markAsPaid(reminder.id));
    }
  });
}
