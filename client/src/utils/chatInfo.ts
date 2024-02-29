import { ChatType, UserType } from "@/types/types";

export const chatInfo = (users: UserType[], loggedInUser: UserType, chat: ChatType):ChatType => {
  // console.log("chatInfo.ts",chat)
    if (chat.isGroupChat) {
      return chat;
    } else {

      let getSecondUser = users.filter((user) => user.id !== loggedInUser.id);
      let secondUser = getSecondUser[0];
      let updateChatInfo =  {
        ...chat,
        username:secondUser?.username,
        name: secondUser?.name === "" ? secondUser?.username : secondUser?.name,
        picture: secondUser?.profilePic,
        tempId:secondUser?.id,
      } 

      return updateChatInfo
    }
  };
  