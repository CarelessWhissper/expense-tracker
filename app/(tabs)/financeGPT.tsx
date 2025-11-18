import {
  addUserMessage,
  createNewChat,
  sendMessageAsync,
  setActiveChat,
} from "@/redux/chatSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function FinanceChat() {
  const dispatch = useDispatch<AppDispatch>();
  const { chats, activeChatId, status } = useSelector(
    (state: RootState) => state.chat
  );

  const activeChat = chats.find((c) => c.id === activeChatId);
  const [input, setInput] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const flatRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    // scroll to bottom when activeChat changes or messages updated
    setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [activeChatId, activeChat?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeChatId) return;

    // add user message to active chat
    dispatch(addUserMessage(input));

    // trigger async API call (will append AI reply when fulfilled)
    dispatch(sendMessageAsync({ chatId: activeChatId, userMessage: input }));

    setInput("");
    setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 150);
  };

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const handleCreateNewChat = () => {
    dispatch(createNewChat());
    setDrawerVisible(false);
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const isActive = item.id === activeChatId;
    const lastMsg = item.messages[item.messages.length - 1];
    return (
      <TouchableOpacity
        onPress={() => {
          dispatch(setActiveChat(item.id));
          setDrawerVisible(false);
        }}
        style={[
          styles.chatListItem,
          isActive && { backgroundColor: "#377D22" },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.chatListTitle, isActive && { color: "#fff" }]}>
            {item.id}
          </Text>
          {lastMsg && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.chatListPreview, isActive && { color: "#e6f7ea" }]}
            >
              {lastMsg.from === "user" ? "You: " : "AI: "}
              {lastMsg.text}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.chatBadge,
            isActive && { backgroundColor: "#fff", color: "#377D22" },
          ]}
        >
          {item.messages.length}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Sticky Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>FinanceGPT</Text>

          <View style={styles.topRight}>
            <TouchableOpacity
              onPress={() => {
                handleCreateNewChat();
              }}
              style={styles.iconButton}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={openDrawer} style={styles.iconButton}>
              <Ionicons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat area */}
        <View style={styles.container}>
          <FlatList
            ref={flatRef}
            data={activeChat?.messages || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.from === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={{ color: item.from === "user" ? "#fff" : "#222" }}>
                  {item.text}
                </Text>
              </View>
            )}
            contentContainerStyle={{ padding: 16, paddingTop: 10 }}
            inverted={false}
            onContentSizeChange={() =>
              flatRef.current?.scrollToEnd({ animated: true })
            }
          />

          {status === "loading" && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#377D22" />
              <Text style={{ marginLeft: 8, color: "#666" }}>
                FinanceGPT typt...
              </Text>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Typ je vraag..."
              style={styles.input}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat History Drawer (Modal) */}
        <Modal
          visible={drawerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeDrawer}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Chat History</Text>
              <TouchableOpacity onPress={closeDrawer}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              style={{ flex: 1 }}
            />

            <View style={styles.drawerFooter}>
              <TouchableOpacity
                onPress={() => {
                  handleCreateNewChat();
                  setTimeout(closeDrawer, 150);
                }}
                style={styles.newChatBtn}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.newChatText}>Nieuwe chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#b87500" },

  topBar: {
    height: 64,
    backgroundColor: "#377D22",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 12 : 0,
  },
  topTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
  },

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  aiBubble: {
    backgroundColor: "#FFF8EE",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#377D22",
    alignSelf: "flex-end",
  },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F7F3EE",
    borderWidth: 1,
    borderColor: "#E2D8C7",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#377D22",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  /* Drawer styles */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "80%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.12,
    elevation: 10,
    paddingTop: Platform.OS === "ios" ? 48 : 20,
    paddingHorizontal: 12,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  chatListItem: {
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F4F4F4",
  },
  chatListTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  chatListPreview: {
    color: "#666",
    fontSize: 13,
  },
  chatBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    color: "#333",
    fontWeight: "700",
  },
  drawerFooter: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  newChatBtn: {
    backgroundColor: "#377D22",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  newChatText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "700",
  },
});
