import React from "react";
import { View } from "react-native";
import ReminderCard from "./ReminderCard";

export default function ReminderList({ reminders, onDelete }) {
  return (
    <View>
      {reminders.map((item) => (
        <ReminderCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </View>
  );
}
