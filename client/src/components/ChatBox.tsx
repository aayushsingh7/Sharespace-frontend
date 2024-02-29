import { MESSAGE_SEEN } from "@/graphQl/mutations";
import {
  handleChatNotification,
  handleOpenChat,
  handleSelectedChatChanged,
  setSelectedChat,
} from "@/slice/chatSlice";
import { RootState } from "@/store/store";
import { ChatType } from "@/types/types";
import { chatInfo } from "@/utils/chatInfo";
import convertMessageCreatedAt from "@/utils/convertMessageCreatedAt";
import messageSeenFunction from "@/utils/handleUnSeenMessages";
import { useApolloClient, useMutation } from "@apollo/client";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ChatBoxProps {
  hover?: boolean;
  data: ChatType;
  socket: any;
}

const ChatBox: FC<ChatBoxProps> = ({ hover, data, socket }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const client = useApolloClient();
  const [unReadMessages, setUnReadMessages] = useState<string[]>([]);
  const isChatOpen = useSelector((state:RootState)=> state.chat.openChat)
  const [time,setTime] = useState()
  const [messagesSeenMutation] = useMutation(MESSAGE_SEEN);
  const messageLoading = useSelector(
    (state: RootState) => state.more.messageLoading
  );
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );
  
  const messageSeen = ()=> {
    if (unReadMessages.length > 0) {
      const seenMsg = messagesSeenMutation({
        variables: { messagesId: unReadMessages, userId: loggedInUser.id },
      });
    }
  }

  const openChatFunction = () => {
  messageSeen()
    dispatch(
      handleChatNotification({
        data: data.id,
        operation: "remove",
        client: client,
        userId: loggedInUser.id,
      })
    );
    dispatch(setSelectedChat(data));
    dispatch(handleSelectedChatChanged(data.id));
    if (window.innerWidth <= 700) {
      dispatch(handleOpenChat(true));
    }
  };

  useEffect(()=> {
  updateTime()
  },[chats])

  useEffect(()=> {
    // window.alert("teri ma ki jai")
    if(!messageLoading) messageSeenFunction(data, setUnReadMessages, loggedInUser);
  },[messageLoading])

  useEffect(()=> {
    messageSeenFunction(data, setUnReadMessages, loggedInUser);
    messageSeen()
  },[data.messages])



  useEffect(() => {
    messageSeenFunction(data, setUnReadMessages, loggedInUser);
    const updateDataAndTime = () => {
      updateTime();
    };
    updateDataAndTime();
    const intervalId = setInterval(() => {
      console.log('Interval triggered...');
      updateDataAndTime();
    }, 60000);
    return () => {
      clearInterval(intervalId);
      console.log('Interval cleared on component unmount.');
    };
  }, []);
  

  const updateTime = ()=> {
    //@ts-ignore
    setTime(convertMessageCreatedAt(parseInt(data?.latestMessage?.createdAt)));
  }

  

  return (
    <div
      className={`chat-box-contanier flex ai-center jc-start w-100 c-pointer p-10 ${
        hover ? "hover" : ""
      }`}
      onClick={openChatFunction}
      style={
        data.id === selectedChat.id
          ? { background: "#242424" }
          : { cursor: "pointer" }
      }
    >
      <div
        className="relative profile-pic br-50 of-hidden"
        style={{ marginRight: "10px" }}
      >
        <Image
          className="ofit-cover"
          src={`${chatInfo(data.users, loggedInUser, data).picture}`}
          alt=""
          fill={true}
        />
      </div>

      <div className="flex ai-center jc-sb w-100 handle-view">
        <div className="flex ai-start jc-start f-d-c primary-text-color">
          <p className="fs-m-normal" style={{ marginBottom: "0px" }}>
            {chatInfo(data.users, loggedInUser, data).name}
          </p>

          <div className="flex ai-center jc-start w-100">
            <p
              style={{ marginTop: "6px", fontSize: "1rem" }}
              className={`of_hidden flex-1 wk-box ${
                unReadMessages.length <= 0
                  ? "secondary-text-color"
                  : "primary-text-color fw-600"
              }`}
            >
              {unReadMessages.length > 0
                ? unReadMessages.length > 9
                  ? "9+ new messages"
                  : `${unReadMessages.length} new messages `
                : data?.latestMessage?.dataType === "reel" ||
                  data?.latestMessage?.dataType === "post"
                ? `${
                    data?.latestMessage?.user.id === loggedInUser.id
                      ? "you sent an attachment"
                      : `${data?.latestMessage?.user.username} sent an attachment`
                  }`
                : !data?.latestMessage
                ? null
                : data?.latestMessage?.user?.id === loggedInUser.id
                ? `You: ${data?.latestMessage?.text}`
                : `${data?.latestMessage?.text}`}
            </p>
            {!data?.latestMessage ? null : (
              <>
                <div style={{ marginTop: "6px" }}>
                  {" "}
                  <span
                    style={{ margin: "1px", marginLeft: "6px" }}
                    className="relative secondary-text-color"
                  >
                    •
                  </span>{" "}
                  <span className="secondary-text-color">{time}</span>
                </div>
              </>
            )}
          </div>
          {/* <p>{data?.latestMessage.text   }</p> */}
        </div>

        {unReadMessages.length <= 0 ? null : (
          <div
            className="flex ai-center jc-center h-100"
            style={{ marginLeft: "10px", padding: "7px" }}
          >
            <span
              style={{ width: "10px", height: "10px" }}
              className="highlight-bg-color br-50"
            ></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
