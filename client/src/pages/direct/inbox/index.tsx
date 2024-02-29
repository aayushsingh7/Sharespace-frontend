import { CHATS } from "@/graphQl/queries";
import ChatLayout from "@/layouts/ChatLayout";
import MessageLayout from "@/layouts/MessageLayout";
import { setChats } from "@/slice/chatSlice";
import { handleLoadingTask } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import { ChatType } from "@/types/types";
import { useQuery } from "@apollo/client";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";

interface InboxProps {}

const Inbox: FC<InboxProps> = ({}) => {
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );
  const dispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chat.chats);
  const [socketState, setSocketState] = useState<any>();
  const [chatsLoading,setChatsLoading] = useState<boolean>(true)

  const { loading, data, error } = useQuery(CHATS, {
    variables: {
      userId: loggedInUser.id,
    },
    skip: chats.length > 0 || !loggedInUser.id,
  });

  useEffect(() => {
    setChatsLoading(true)
    dispatch(handleLoadingTask(true));
    if (loading) {
      return;
    }
     else {
      if (data?.chats) {
        const chats = data?.chats;
        dispatch(setChats(chats));
      }
      dispatch(handleLoadingTask(false));
      setChatsLoading(false)
    }
  }, [loading]);

  useEffect(() => {
    const socket = io("https://api-sharesapce-backend.onrender.com/")

    setSocketState(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>ShareSpace • Direct</title>
      </Head>
      <div className="w-100 h-100 flex ai-start jc-start inbox-container">
        <ChatLayout loading={chatsLoading} socket={socketState} />
        {selectedChat.id === "" ? (
          <div
            className="h-100 w-100 flex ai-center jc-center f-d-c template"
            style={{ height: "100%" }}
          >
            <AiOutlineMessage />
            <p className="primary-text-color">Your Messages</p>
            <span>
              Send private photos, posts, reels and messages to a friend
            </span>
          </div>
        ) : (
          <MessageLayout socket={socketState} />
        )}
      </div>
    </>
  );
};

export default Inbox;
