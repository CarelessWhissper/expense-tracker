
import ReminderForm from "@/components/reminders/ReminderForm";
import ReminderList from "@/components/reminders/ReminderList";
import { useState } from "react";
import { View } from "react-native";

export default function SavingsReminderScreen() {
  const [reminders, setReminders] = useState([]);

  const handleAdd = (reminder) => {
    setReminders((prev) => [...prev, reminder]);
  };

  const handleDelete = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ReminderForm onSubmit={handleAdd} />
      <ReminderList reminders={reminders} onDelete={handleDelete} />
    </View>
  );
}