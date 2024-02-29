import User from "@/models/user";
import { RootState } from "@/store/store";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  showMoreOptions: false,
  loadingTask: false,
  viewProfile: false,
  showFollowingBox: false,
  showFollowersBox: false,
  token: "",
  openStoryBox: false,
  selfUpload: false,
  bottomNotification: false,
  notificationText: "",
  isMuted: true,
  openNotificationBar: false,
  notifications: [],
  unSeenNotification: [],
  openEditPost: false,
  deleteConfirmation: false,
messageLoading:false,
};

const moreSlice = createSlice({
  name: "moreOptions",
  initialState,
  reducers: {
    handleDeleteConfirmation(state, action) {
      state.deleteConfirmation = action.payload;
    },
    handleShowMoreOptions(state, action) {
      state.showMoreOptions = action.payload;
    },
    handleLoadingTask(state, action) {
      state.loadingTask = action.payload;
    },
    handleViewProfile(state, action) {
      state.viewProfile = action.payload;
    },
    handleFollowingBox(state, action) {
      state.showFollowingBox = action.payload;
    },
    handleFollowersBox(state, action) {
      state.showFollowersBox = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    handleOpenStoryBox(state, action) {
      state.openStoryBox = action.payload;
    },
    handleSelfUpload(state, action) {
      state.selfUpload = action.payload;
    },
    showBottomNotification(state, action) {
      const { text, view } = action.payload;
      state.bottomNotification = view;
      state.notificationText = text;
    },
    handleMute(state, action) {
      state.isMuted = action.payload;
    },
    handleNotificationBar(state, action) {
      state.openNotificationBar = action.payload;
    },
    setNotifications(state, action) {
      state.notifications = action.payload;
    },
    addNewNotification(state, action) {
      //@ts-ignore
      const { payload } = action;
      const existingNotificationIndex = state.notifications.findIndex(
        (notification: any) => notification.id === action.payload.id
      );

      const baseQuery: any = {
        "sender.id": payload.sender.id,
        notificationType: payload.notificationType,
      };

      if (
        payload.notificationType === "liked" ||
        payload.notificationType === "commented" ||
        payload.notificationType === "replied"
      ) {
        const postOrReelPayload = payload.post || payload.reel;
        baseQuery[postOrReelPayload ? "post.id" : "reel.id"] =
          postOrReelPayload.id;
      }

      if (
        payload.notificationType === "commented" ||
        payload.notificationType === "replied"
      ) {
        baseQuery.text = payload.text;
      }

      const findSameNotification: any = state.notifications.find(
        (notification: any) => {
          for (const key in baseQuery) {
            if (notification[key] !== baseQuery[key]) {
              return false;
            }
          }
          return true;
        }
      );

     
      if (existingNotificationIndex !== -1) {
        //@ts-ignore
        state.notifications[existingNotificationIndex] = action.payload;
        //@ts-ignore
        if (!state.unSeenNotification.map((notification) => notification.id).includes(action.payload.id)
        ) {
          //@ts-ignore
          state.unSeenNotification = state.unSeenNotification = [{id: action.payload.id,__typename: "NotificationType",},...state.unSeenNotification,];}
      } else if (findSameNotification) {

        const getIndex = state.notifications.findIndex(
          (notification: any) => notification.id === findSameNotification.id
        );
        if (getIndex !== -1) {
          //@ts-ignore
          state.notifications[getIndex] = action.payload

        }
      } else {
        //@ts-ignore
        state.notifications = [...state.notifications, action.payload].sort(
          (a: any, b: any) => b.createdAt - a.createdAt
        );
        //@ts-ignore
        state.unSeenNotification = [{id: action.payload.id, __typename: "NotificationType",}, ...state.unSeenNotification]
      }
    },
    removeFollowRequest(state, action) {
      const { sender, notificationType } = action.payload;
      
      const getNotification: any = state.notifications.find(
        (notification: any) => {
          return (
            notification.sender.id === sender &&
            notification.notificationType === notificationType
          );
        }
      );

      state.notifications = state.notifications
        .filter((notification: any) => {
          return notification.id !== getNotification.id;
        })
        .sort((a: any, b: any) => a.updatedAt - b.updatedAt);

      state.unSeenNotification = state.unSeenNotification.filter(
        (notification: any) => notification !== getNotification.id
      );
    },
    handleNotificationSeen(state, action) {
      const { notificationIds, userId } = action.payload;
      //@ts-ignore
      state.unSeenNotification = state.unSeenNotification.filter((notification) => !notificationIds.includes(notification.id));
      //@ts-ignore
      state.notifications = state.notifications.map((notification: any) => {
        if (notificationIds.includes(notification.id)) {
        
          return {
            ...notification,
            seenBy: [...notification.seenBy, userId],
          };
        } else {
          return notification;
        }
      });
    },
    setUnSeenNotifications(state, action) {
      state.unSeenNotification = action.payload;
    },
    handleEditPost(state, action) {
      state.openEditPost = action.payload;
    },
    handleMessageLoading(state,action){
      state.messageLoading = action.payload
    }
  },
});

export const {
  handleDeleteConfirmation,
  handleEditPost,
  setUnSeenNotifications,
  handleNotificationSeen,
  removeFollowRequest,
  addNewNotification,
  setNotifications,
  handleNotificationBar,
  handleMute,
  showBottomNotification,
  handleSelfUpload,
  handleOpenStoryBox,
  setToken,
  handleShowMoreOptions,
  handleFollowersBox,
  handleFollowingBox,
  handleLoadingTask,
  handleViewProfile,
  handleMessageLoading
} = moreSlice.actions;
export default moreSlice.reducer;
