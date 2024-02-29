import { UN_READ_MESSAGES } from "@/graphQl/queries";
import Chat from "@/models/chat";
import { ChatType, MessageType } from "@/types/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { useRouter } from "next/router";

const initialState = {
  openChat: false,
  selectedChat: Chat,
  chats: [],
  selectedChatChanged: null,
  newMessage: "",
  unSeenChatsNotification: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    handleOpenChat(state, action) {
      state.openChat = action.payload;
    },
    setSelectedChat(state, action) {
      state.selectedChat = action.payload;
    },
    setChats(state, action) {
      const updatedChats = action.payload.map((chat: ChatType) => {
        return {
          ...chat,
        };
      });
      // @ts-ignore
      state.chats = updatedChats;
    },
    setMessages(state, action) {
      const { data, chatId } = action.payload;
      //@ts-ignore
      state.chats = state.chats.map((chat: ChatType) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: data,
          };
        } else {
          return chat;
        }
      });
    },
    addNewChat(state, action) {
      // @ts-ignore
      let isChatExists = state.chats.find(
        (chat: ChatType) => chat.id === action.payload.id
      );
      if (isChatExists) return;
      // @ts-ignore
      state.chats = [action.payload, ...state.chats];
    },
    addNewMessageReceiver(state,action){
      const { newMessage, chat, messageId } = action.payload;

      //@ts-ignore
      state.chats = state.chats.map((c: ChatType) => {
        if (c.id === chat.id) {
            return {
              ...c,
              messages:[...c.messages,newMessage],
              latestMessage:newMessage,
            }
        } else {
          return c;
        }
      });
    },
    addNewMessage(state, action) {
      const { newMessage, chat, messageId } = action.payload;

      //@ts-ignore
      state.chats = state.chats.map((c: ChatType) => {
        if (c.id === chat.id) {
            return {
              ...c,
              messages:c.messages.map((m:MessageType)=> {
                if(m.messageId === messageId){
                 
                  return {
                    ...m,
                    ...newMessage
                  }
                }else{
                  return m
                }
              })
            }
        } else {
          return c;
        }
      });
    },
    sendingNewMessage(state,action) {
      const { newMessage, chat } = action.payload;

      //@ts-ignore
      state.chats = state.chats.map((c: ChatType) => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            updatedAt: new Date().getTime(),
            latestMessage: newMessage,
          };
        } else {
          return c;
        }
      });
    },
    updateChat(state, action) {
      //@ts-ignore
      state.chats.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    handleSelectedChatChanged(state, action) {
      state.selectedChatChanged = action.payload;
    },
    isChatExists(state, action) {
      let chat = state.chats.find(
        (chat: ChatType) => chat.id === action.payload.id
      );
      if (chat) {
        return;
      } else {
        // @ts-ignore
        state.chats = [action.payload, ...state.chats];
      }
    },
    handleMessageSeen(state, action) {
      const { userId } = action.payload;

      //@ts-ignore
      state.chats = state.chats.map((chat: ChatType) => {
        if (chat.id === state.selectedChat.id) {
          return {
            ...chat,
            messages: chat.messages.map((msg) => {
              if (!msg.seenBy.includes(userId)) {
                return {
                  ...msg,
                  seenBy: [...msg.seenBy, userId],
                };
              } else {
                return msg;
              }
            }),
          };
        } else {
          return chat;
        }
      });
    },
    handleNewMessage(state, action) {
      console.log("handleNewMessage(state,action)");
      state.newMessage = action.payload;
    },
    handleUpdateChat(state, action) {
      const { chat, newMessage } = action.payload;
      //@ts-ignore
      state.chats = state.chats.map((c: ChatType) => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: newMessage.id,
                seenBy: newMessage.seenBy,
              },
            ],
            updatedAt: new Date().getTime(),
            latestMessage: newMessage,
          };
        } else {
          return c;
        }
      });
    },
    handleChatNotification(state, action) {
      const { data, operation, client, userId } = action.payload;
      if (operation === "set") {
        state.unSeenChatsNotification = data;
      } else if (operation === "remove") {
        state.unSeenChatsNotification = state.unSeenChatsNotification.filter(
          (chat: any) => chat.id !== data
        );

        const notificationCache = client.readQuery({
          query: UN_READ_MESSAGES,
          variables: { userId: userId },
        });

        if(!notificationCache) return;

        const updatedCache = notificationCache?.unReadChats.filter(
          (chat: any) => chat.id !== data
        );

        client.writeQuery({
          query: UN_READ_MESSAGES,
          variables: { userId: userId },
          data: {
            unReadChats: updatedCache,
          },
        });

      } else if (operation === "add") {
        //@ts-ignore
        if (!state.unSeenChatsNotification.some(item => item.id === data)) {
          //@ts-ignore
          state.unSeenChatsNotification = [...state.unSeenChatsNotification, { id: data }];
        }
        

        const notificationCache = client.readQuery({
          query: UN_READ_MESSAGES,
          variables: { userId: userId },
        });
 
        if(!notificationCache) return;
      
       if(!notificationCache?.unReadChats.some((item:any) => item.id === data)){
        const updatedCache = [
          ...notificationCache?.unReadChats,
          {
            id: data,
            __typename: "ChatType",
          },
        ];

        client.writeQuery({
          query: UN_READ_MESSAGES,
          variables: { userId: userId },
          data: {
            unReadChats: updatedCache,
          },
        });
       }

      }
    },
  },
});

export const {
  handleChatNotification,
  handleUpdateChat,
  handleMessageSeen,
  setMessages,
  updateChat,
  isChatExists,
  handleSelectedChatChanged,
  addNewMessage,
  addNewChat,
  handleOpenChat,
  setSelectedChat,
  setChats,
  handleNewMessage,
  sendingNewMessage,
  addNewMessageReceiver
} = chatSlice.actions;
export default chatSlice.reducer;