import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);

      // Update last message in chat
      const chat = state.chats.find(c => c.id === action.payload.senderId || c.id === action.payload.receiverId);
      if (chat) {
        chat.lastMessage = action.payload;
        chat.updatedAt = action.payload.timestamp;
        if (action.payload.senderId !== state.currentChat?.id) {
          chat.unreadCount += 1;
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      state.messages.forEach(msg => {
        if (msg.senderId === action.payload) {
          msg.read = true;
        }
      });

      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
  },
});

export const {
  setChats,
  setCurrentChat,
  setMessages,
  addMessage,
  markMessagesAsRead,
  setLoading,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
