import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  from: "user" | "ai";
  text: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
}

interface ChatsState {
  chats: ChatSession[];
  activeChatId: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: ChatsState = {
  chats: [
    {
      id: "chat-1",
      messages: [
        {
          id: "welcome",
          from: "ai",
          text: "Hallo! Ik ben FinanceGPT. Hoe kan ik je helpen met je geldzaken?",
        },
      ],
    },
  ],
  activeChatId: "chat-1",
  status: "idle",
  error: null,
};

export const sendMessageAsync = createAsyncThunk(
  "chats/sendMessage",
  async (
    { chatId, userMessage }: { chatId: string; userMessage: string },
    thunkAPI
  ) => {
    try {
      const response = await fetch(
        "http://192.168.48.111:8086/budgeteer/api/financegpt/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consumer: "",
            msg: userMessage,
          }),
        }
      );

      const data = await response.json();

      const aiReply =
        data?.rspObject?.[0]?.message?.content ??
        "FinanceGPT is bezig, proeven later nogmaals.";

      return { chatId, aiReply };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    /** Nieuwe chat aanmaken */
    createNewChat: (state) => {
      const newId = `chat-${Date.now()}`;
      state.chats.push({
        id: newId,
        messages: [
          {
            id: "welcome-" + newId,
            from: "ai",
            text: "Nieuwe chat gestart! Waarmee kan ik je helpen?",
          },
        ],
      });
      state.activeChatId = newId;
    },

    /** Wissel tussen chats */
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },

    /** User message toevoegen */
    addUserMessage: (state, action) => {
      const chat = state.chats.find((c) => c.id === state.activeChatId);
      if (!chat) return;

      chat.messages.push({
        id: Date.now().toString(),
        from: "user",
        text: action.payload,
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendMessageAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.status = "idle";
        const chat = state.chats.find((c) => c.id === action.payload.chatId);
        if (!chat) return;

        chat.messages.push({
          id: Date.now().toString(),
          from: "ai",
          text: action.payload.aiReply,
        });
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { createNewChat, setActiveChat, addUserMessage } =
  chatsSlice.actions;
export default chatsSlice.reducer;
