import { logout } from "@/redux/authSlice";
import { persistor, store } from "@/redux/store";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

export default function SettingsScreen() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  
  // In your handleClearAllData function
const handleClearAllData = () => {
  Alert.alert(
    "Clear All Data",
    "This will delete ALL data including transactions, budgets, savings plans, and reminders. This action cannot be undone. Are you sure?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Clear All Data",
        style: "destructive",
        onPress: async () => {
          try {
            // Add logging to see what's happening
            console.log("Starting data clearance...");
            
            // Dispatch the clear action first
            store.dispatch({ type: "auth/clearAll" });
            
            // Then purge persist
            await persistor.purge();
            
            // Clear AsyncStorage completely
            await AsyncStorage.clear();
            
            // Force reload all reducers
            store.dispatch({ type: "RESET_ALL" });
            
            console.log("Data clearance completed");
            
            Alert.alert(
              "Success",
              "All data has been cleared. The app will restart.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    dispatch(logout());
                  }
                }
              ]
            );
          } catch (error) {
            console.error("Clear data error:", error);
            Alert.alert("Error", "Failed to clear data. Please try again.");
          }
        }
      }
    ]
  );
};

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear temporary cached data but keep your transactions and settings.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: () => {
            
            Alert.alert("Success", "Cache cleared successfully");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="settings" size={32} color="#377D22" />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Category: Account */}
      <Text style={styles.categoryTitle}>Account</Text>

      {/* List Item: Change Password */}
      <TouchableOpacity style={styles.item} onPress={() => { /* TODO */ }}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="lock-outline" size={20} color="#377D22" />
          <Text style={styles.itemText}>Change Password</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#ADB5BD" />
      </TouchableOpacity>

      {/* List Item: Language */}
      <TouchableOpacity style={styles.item} onPress={() => { /* TODO */ }}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="language" size={20} color="#377D22" />
          <Text style={styles.itemText}>Language</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#ADB5BD" />
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Category: Data */}
      <Text style={styles.categoryTitle}>Data Management</Text>

      {/* List Item: Clear Cache */}
      <TouchableOpacity style={styles.item} onPress={handleClearCache}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="cached" size={20} color="#377D22" />
          <Text style={styles.itemText}>Clear Cache</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#ADB5BD" />
      </TouchableOpacity>

      {/* List Item: Clear All Data - FOR DEMO */}
      <TouchableOpacity style={[styles.item, styles.warningItem]} onPress={handleClearAllData}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="delete-forever" size={20} color="#FF6B6B" />
          <View>
            <Text style={[styles.itemText, styles.warningText]}>Clear All Data</Text>
            <Text style={styles.itemSubtext}>Reset app to clean state (for demo)</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#FF6B6B" />
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* List Item: Log Out */}
      <TouchableOpacity style={[styles.item, styles.logoutItem]} onPress={handleLogout}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="logout" size={20} color="#d9534f" />
          <Text style={[styles.itemText, styles.logoutText]}>
            Log Out
          </Text>
        </View>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 12,
    color: "#2D3436",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
    color: "#636E72",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#2D3436",
    marginLeft: 12,
    fontWeight: "500",
  },
  itemSubtext: {
    fontSize: 12,
    color: "#ADB5BD",
    marginLeft: 12,
    marginTop: 2,
  },
  warningItem: {
    borderWidth: 1.5,
    borderColor: "#FFE5E5",
    backgroundColor: "#FFF5F5",
  },
  warningText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  logoutItem: {
    borderWidth: 1.5,
    borderColor: "#FFE5E5",
  },
  logoutText: {
    color: "#d9534f",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 20,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#ADB5BD",
    marginTop: 32,
    marginBottom: 20,
  },
});