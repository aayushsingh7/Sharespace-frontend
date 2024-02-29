import ReceiveMessageBox from "@/components/ReceiveMessageBox";
import SendMessageBox from "@/components/SendMessageBox";
import { NEW_MESSAGE } from "@/graphQl/mutations";
import { CHATS, MESSAGES } from "@/graphQl/queries";
import User from "@/models/user";
import {
  addNewMessage,
  handleMessageSeen,
  handleOpenChat,
  sendingNewMessage,
  setMessages,
  setSelectedChat,
} from "@/slice/chatSlice";
import { handleLoadingTask, handleMessageLoading } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/MessagesLayout.module.css";
import { ChatType, MessageType } from "@/types/types";
import { chatInfo } from "@/utils/chatInfo";
import { getSecondUser } from "@/utils/getSecondUser";
import getUniqueId from "@/utils/getUniqueID";
import handleMessageCacheAndStatus from "@/utils/handleMessageCacheAndStatus";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { FC, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

interface MessagesLayoutProps {
  socket: any;
}

const MessageLayout: FC<MessagesLayoutProps> = ({ socket }) => {
  const client = useApolloClient();
  const openChat = useSelector((state: RootState) => state.chat.openChat);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );

  const [addNewMessageMutation] = useMutation(NEW_MESSAGE);

  const [message, setMessage] = useState<string>("");
  const dispatch = useDispatch();
  const chats: ChatType[] = useSelector((state: RootState) => state.chat.chats);
  const messageLoading = useSelector(
    (state: RootState) => state.more.messageLoading
  );
  const getChat = chats.find((chat) => chat.id === selectedChat.id);
  const bottomRef = useRef(null);
  const messageLoadedRef = useRef<boolean>(false);
  const requestProcessing = useRef<boolean>(false);
  const messageQueue = useRef<any[]>([]);

  const { loading, data, error } = useQuery(MESSAGES, {
    variables: {
      chatId: selectedChat.id,
    },
    skip: selectedChat.id === "",
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    dispatch(handleMessageLoading(true));
    dispatch(handleLoadingTask(true));
    if (loading) {
      return;
    }
    if (error) {
      console.log(error);
    } else {
      if (data?.messages) {
        console.log(
          ".........................................................................."
        );
        dispatch(
          setMessages({ data: data?.messages, chatId: selectedChat.id })
        );

        dispatch(handleLoadingTask(false));

        dispatch(handleMessageSeen({ userId: loggedInUser.id }));
        dispatch(handleMessageLoading(false));

        messageLoadedRef.current = true;
      }
    }
  }, [data]);

  const handleMessageRequests = async (e?: any) => {
    const newMessage = {
      messageId: getUniqueId(),
      user: {
        id: loggedInUser.id,
        username: loggedInUser.username,
        name: loggedInUser.name,
        profilePic: loggedInUser.profilePic,
      },
      text: message,
      createdAt: `${new Date().getTime()}`,
      dataType: "text",
      replys: [],
      reaction: "",
      deleted: false,
      postInfo: null,
      seenBy: [loggedInUser.id],
      status: "sending",
    };

    if (e && e.key === "Enter") {
      setMessage("");
      console.log("this will only trigger on direct enter key press messages");
      setMessage("");
      messageQueue.current = [...messageQueue.current, newMessage];

      handleMessageCacheAndStatus(client, "sending", selectedChat, newMessage);

      dispatch(
        sendingNewMessage({ newMessage: newMessage, chat: selectedChat })
      );
    }

    if (messageQueue.current.length > 0 && !requestProcessing.current) {
      const currentMsg = messageQueue.current[0];
      console.log(
        "check point 2, checking: messageQueue.current.length > 0 && !requestProcessing.current",
        messageQueue.current,
        requestProcessing.current
      );
      await addNewMessageFunction(currentMsg);
    } else {
      console.log("failed to meet the reqirements");
      return;
    }
  };

  const addNewMessageFunction = async (newMessage: any) => {
    requestProcessing.current = true;
    // dispatch(handleMessageLoading(true))
    try {
      const response = await addNewMessageMutation({
        variables: {
          user: loggedInUser.id,
          chatId: selectedChat.id,
          text: newMessage.text,
          dataType: "text",
          messageId: newMessage.messageId,
        },
        update(cache, { data }) {
          messageQueue.current = messageQueue.current.filter((msg) => {
            return msg.messageId !== newMessage.messageId;
          });

          // @ts-ignore
          // const { chats } = cache.readQuery({
          //   query: CHATS,
          //   variables: {
          //     userId: loggedInUser.id,
          //   },
          // });

          // // console.log("chats cache-------------------------------------------------",chats,data.newMessage)

          // const updatedChats = chats
          //   .map((chat: ChatType) => {
          //     const updatedAt =
          //       typeof chat.updatedAt === "string"
          //         ? parseInt(chat.updatedAt)
          //         : chat.updatedAt;

          //     return chat.id === selectedChat.id
          //       ? {
          //           ...chat,
          //           latestMessage: data.newMessage,
          //           messages: [...chat.messages, data.newMessage],
          //           updatedAt: new Date().getTime(),
          //         }
          //       : {
          //           ...chat,
          //           updatedAt,
          //         };
          //   })
          //   //@ts-ignore
          //   .sort((a, b) => b.updatedAt - a.updatedAt);

          // cache.writeQuery({
          //   query: CHATS,
          //   variables: {
          //     userId: loggedInUser.id,
          //   },
          //   data: {s
          //     chats: updatedChats,
          //   },
          // });
        },
      });

      let data = await response.data;
      requestProcessing.current = false;

      console.log("response.data", data.newMessage);

      socket.emit(
        "NEW_MESSAGE_SEND_TRIGGERED",
        data.newMessage,
        selectedChat,
        loggedInUser,
        getSecondUser(selectedChat.users, loggedInUser),
        newMessage.messageId
      );

      handleMessageRequests();
      // dispatch(handleMessageLoading(false))

      // }
    } catch (err) {
      console.log(err);

      handleMessageCacheAndStatus(client, "failed", selectedChat, newMessage);

      dispatch(
        addNewMessage({
          chat: selectedChat,
          newMessage: {
            ...newMessage,
            status: "failed",
          },
          messageId: newMessage.messageId,
        })
      );
    }
  };

  useEffect(() => {
    //@ts-ignore
    if (messageLoadedRef.current) {
      bottomRefHandler();
    }
  }, [messageLoadedRef.current, getChat?.messages, messageLoading]);

  const bottomRefHandler = () => {
    //@ts-ignore
    if (getChat?.messages.length > 0) {
      //@ts-ignore
      const scrollContainer = bottomRef.current.parentNode;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      scrollContainer.scrollTop = scrollHeight - clientHeight;
    }
  };

  return (
    <div
      className={` relative f-d-c main-bg-color ${
        openChat ? styles.show : styles.hide
      } ${styles.container}`}
    >
      <div
        className={`flex ai-center jc-start w-100  primary-text-color b-bottom zi-100 ${styles.header}`}
      >
        <AiOutlineArrowLeft
          style={{
            fontSize: "30px",
            marginRight: "20px",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => {
            dispatch(handleOpenChat(false));
            dispatch(setSelectedChat(User));
          }}
        />

        {
          <Link
            href={`/profile/${
              // @ts-ignore
              chatInfo(selectedChat.users, loggedInUser, selectedChat)?.username
            }`}
            style={{ textDecoration: "none" }}
          >
            <div className={styles.user}>
              <img
                src={`${
                  chatInfo(selectedChat.users, loggedInUser, selectedChat)
                    .picture
                }`}
                alt=""
              />
              <div>
                <p className="primary-text-color">
                  {
                    chatInfo(selectedChat.users, loggedInUser, selectedChat)
                      .name
                  }
                </p>
                <span>
                  {selectedChat.isGroupChat ? "Group chat" : "single chat"}
                </span>
              </div>
            </div>
          </Link>
        }
      </div>

      <div
        className={`flex ai-start jc-start w-100 f-d-c of-y-scroll of-x-hidden ${styles.message_container}`}
      >
        {messageLoading ? (
          <div
            className="flex ai-center jc-center w-100"
            style={{ padding: "30px" }}
          >
            <ClipLoader
              color={"#f1f1f1"}
              loading={true}
              size={45}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          getChat?.messages?.map((message) => {
            if (message?.user?.id === loggedInUser.id) {
              return <SendMessageBox key={message.id} data={message} />;
            } else {
              return <ReceiveMessageBox key={message.id} data={message} />;
            }
          })
        )}
        <p ref={bottomRef}></p>
      </div>

      <div
        className="p-15 w-100 bottom-0"
        style={{ height: "80px", position: "sticky" }}
      >
        <input
          className="btn fs-normal primary-text-color b-light w-100 br-50 bg-none"
          type="text"
          placeholder="Message..."
          name="message"
          value={message}
          onKeyDown={(e) => handleMessageRequests(e)}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="new-text"
          style={{ padding: "14px" }}
        />
      </div>
    </div>
  );
};

export default MessageLayout;
