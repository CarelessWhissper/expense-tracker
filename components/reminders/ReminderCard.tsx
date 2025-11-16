import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ReminderCard({ item, onDelete }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.row}>Amount: {item.amount}</Text>
        <Text style={styles.row}>Frequency: {item.frequency}</Text>
        <Text style={styles.row}>Start: {item.date}</Text>
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteTxt}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700" },
  row: { marginTop: 4, fontSize: 14, color: "#444" },
  deleteBtn: {
    alignSelf: "center",
    padding: 6,
    backgroundColor: "#e53935",
    borderRadius: 6,
  },
  deleteTxt: { color: "white", fontWeight: "600" },
});
