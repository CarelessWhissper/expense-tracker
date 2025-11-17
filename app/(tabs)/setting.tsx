import { logout } from "@/redux/authSlice";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export default function SettingsScreen() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container}>
      {/* List Item: Change Password */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          /* TODO */
        }}
      >
        <Text style={styles.itemText}>Change Password</Text>
      </TouchableOpacity>

      {/* List Item: Language */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          /* TODO */
        }}
      >
        <Text style={styles.itemText}>Language</Text>
      </TouchableOpacity>

      {/* List Item: Clear Cache */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          /* TODO */
        }}
      >
        <Text style={styles.itemText}>Clear Cache</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* List Item: Log Out */}
      <TouchableOpacity style={styles.item} onPress={handleLogout}>
        <Text
          style={[styles.itemText, { color: "#d9534f", fontWeight: "bold" }]}
        >
          Log Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f3f6f4",
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#111",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
});
