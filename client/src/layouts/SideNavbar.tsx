import {
  CHATS,
  MESSAGES,
  UN_READ_MESSAGES,
  UN_SEEN_NOTIFICATIONS,
} from "@/graphQl/queries";
import Chat from "@/models/chat";
import {
  addNewMessage,
  addNewMessageReceiver,
  handleChatNotification,
  isChatExists,
  setSelectedChat,
  updateChat,
} from "@/slice/chatSlice";
import {
  addNewNotification,
  handleNotificationBar,
  handleViewProfile,
  removeFollowRequest,
  setUnSeenNotifications,
} from "@/slice/moreSlice";
import { handleOpenSideNav, handleUserSearch } from "@/slice/navbarSlice";
import { handleOpenCreatePost } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/SideNavbar.module.css";
import { ChatType } from "@/types/types";
import { useApolloClient, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useRef } from "react";
import { BiMoviePlay, BiSearch, BiSolidMoviePlay } from "react-icons/bi";
import { BsSend, BsSendFill } from "react-icons/bs";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { GoHeart, GoHeartFill, GoHome, GoHomeFill } from "react-icons/go";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";

interface SideNavbarProps {}

const SideNavbar: FC<SideNavbarProps> = ({}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const sideNavbarRef = useRef(null);

  const openSideNav = useSelector(
    (state: RootState) => state.navbar.openSideNav
  );
  const userSearch = useSelector((state: RootState) => state.navbar.userSearch);
  const unSeenNotifications = useSelector(
    (state: RootState) => state.more.unSeenNotification
  );
  const openNotificationBar = useSelector(
    (state: RootState) => state.more.openNotificationBar
  );
  const client = useApolloClient();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const windowWidth = useRef<any>(null);
  const unSeenChats: any[] = useSelector(
    (state: RootState) => state.chat.unSeenChatsNotification
  );
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );
  let user = loggedInUser;

  const handleNavbarsFunctionality = () => {
    dispatch(handleOpenSideNav(userSearch));
    dispatch(handleUserSearch(!userSearch));
    dispatch(handleViewProfile(false));
    dispatch(handleNotificationBar(false));
  };

  const handleNavigation = async (username: string, userId: string) => {
    dispatch(handleViewProfile(true));
    dispatch(handleNotificationBar(false));
  };

  useEffect(() => {
    const socket = io("https://api-sharesapce-backend.onrender.com/");
    socket.on("connect", () => console.log("connect to the main socket.io"));

    socket.on("new_chat", (newChat) => {

      // console.log("new chat is created that means u are the mother fucker")
      // window.alert("new chat is created motherfucker")

      dispatch(isChatExists(newChat));


      // const c = client.readQuery({
      //   query: CHATS,
      //   variables: {
      //     userId: loggedInUser.id,
      //   },
      // });

      // const chats = c?.chats;

      // if (chats) {
       
      //   const updatedChatsArray = [...chats,newChat]

      //   client.writeQuery({
      //     query: CHATS,
      //     variables: {
      //       userId: loggedInUser.id,
      //     },
      //     data: {
      //       chats: updatedChatsArray,
      //     },
      //   })
      // }
      


    });

    socket.on(
      "message_received",
      (newMessage, chat, sender, receiver, dummyMessageId) => {
        console.log("NEW MESSAGE IS HERE",newMessage)

        dispatch(isChatExists(chat));
        console.log("---------------------------------------------------------------",chat)

       if(loggedInUser.id === sender.id){
        dispatch(
          addNewMessage({
            chat: chat,
            newMessage: newMessage,
            messageId: dummyMessageId,
          })
        );
       }else if(loggedInUser.id === receiver.id){
        dispatch(
          addNewMessageReceiver({
            chat: chat,
            newMessage: newMessage,
            messageId: dummyMessageId,
          })
        );
       }


        // @ts-ignore
        const c = client.readQuery({
          query: CHATS,
          variables: {
            userId: loggedInUser.id,
          },
        });

        const chats = c?.chats;

        if (chats) {
         
          const updatedChats = chats
            .map((c: ChatType) => {
         
              // const updatedAt =
              //   typeof c.updatedAt === "string"
              //     ? parseInt( c.updatedAt)
              //     : c.updatedAt;


              if(c.id === chat.id){
                return {
                  ...c,
                  messages:[c.messages,{messageId:newMessage.messageId,seenBy:newMessage.seenBy}],
                }
              }else{
                return {
                  ...c
                }
              }
             
            })
            //@ts-ignore
            .sort((a, b) => b.updatedAt - a.updatedAt);

          client.writeQuery({
            query: CHATS,
            variables: {
              userId: loggedInUser.id,
            },
            data: {
              chats: updatedChats,
            },
          });
          console.log("chats update hone ke bad kuch asa dikh raha hai",updatedChats)
        } 




        const prevMsg = client.readQuery({
          query: MESSAGES,
          variables: {
            chatId: chat.id,
          },
        });

        if (!prevMsg) return;

        client.writeQuery({
          query: MESSAGES,
          variables: {
            chatId: chat.id,
          },
          data:
            sender.id === loggedInUser.id
              ? {
                  //@ts-ignore
                  messages: prevMsg.messages.map((message: MessageType) => {
                    if (message.messageId === newMessage.messageId) {
                      return newMessage;
                    } else {
                      return message;
                    }
                  }),
                }
              : {
                  messages: [...prevMsg.messages, newMessage],
                },
        });

        dispatch(updateChat("update"));
      }
    );

    socket.on("message_received", (newMessage, chat, sender, receiver) => {
      if (receiver.id === user.id && chat.id !== selectedChat.id) {
        // @ts-ignore
        // const { chats } = client.readQuery({
        //   query: CHATS,
        //   variables: {
        //     userId: loggedInUser.id,
        //   },
        // });

        // console.log(
        //   "chats chats chats chats chats chats chats chats chats",
        //   chats
        // );

        // if (chats) {
        //   console.log("newMessage insdie sideNavbar", newMessage);
        //   const updatedChats = chats
        //     .map((c: ChatType) => {
        //       console.log(c.id === chat.id)
        //       // const updatedAt =
        //       //   typeof chat.updatedAt === "string"
        //       //     ? parseInt(                                                                                                                                                                                                                                                                                                    chat.updatedAt)
        //       //     : chat.updatedAt;

        //       // return chat.id === selectedChat.id
        //       //   ? {
        //       //       ...chat,
        //       //       latestMessage: newMessage,
        //       //       messages: [...chat.messages,newMessage],
        //       //       updatedAt: new Date().getTime(),
        //       //     }            
        //       //   : {
        //       //       ...chat,
        //       //       updatedAt,                                                                                                                                                                 
        //       //     };                 
        //       return c.id === chat.id
        //         ? {
        //             ...chat,
        //             latestMessage: newMessage,
        //             messages: [...chat.messages, newMessage],
        //             updatedAt: new Date().getTime(),
        //           }
        //         : {
        //             ...chat,
        //           };
        //     })
        //     //@ts-ignore
        //     .sort((a, b) => b.updatedAt - a.updatedAt);

        //   client.writeQuery({
        //     query: CHATS,
        //     variables: {
        //       userId: loggedInUser.id,
        //     },
        //     data: {
        //       chats: updatedChats,
        //     },
        //   });
        // } else {
        //   console.log(
        //     "_______________________________ not verified__________________________________"
        //   );
        // }

        // window.alert("new message received");
        dispatch(
          handleChatNotification({
            data: chat.id,
            operation: "add",
            client: client,
            userId: loggedInUser.id,
          })
        );
      }
    });

    socket.on("new_notification", (notification) => {
      if (notification.receiver == loggedInUser.id) {
        dispatch(addNewNotification(notification));
      }
    });

    socket.on("cancle_follow_request", (receiver, sender, notificationType) => {
      if (receiver == loggedInUser.id) {
        dispatch(
          removeFollowRequest({
            sender: sender,
            notificationType: notificationType,
          })
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loggedInUser, selectedChat]);

  useEffect(() => {
    windowWidth.current = window.innerWidth;
    //@ts-ignore
  }, [openSideNav, sideNavbarRef.current?.style?.width]);

  const {
    loading: nLoading,
    data: nData,
    error: nError,
  } = useQuery(UN_SEEN_NOTIFICATIONS, {
    variables: {
      userId: loggedInUser.id,
    },
    skip: loggedInUser.id === "",
  });

  const {
    loading: chatNotificationLoading,
    data: chatNotificationData,
    error: chatNotificationError,
  } = useQuery(UN_READ_MESSAGES, {
    variables: { userId: loggedInUser.id },
    skip: loggedInUser.id === "",
  });

  useEffect(() => {
    if (chatNotificationData?.unReadChats) {
      console.log(
        "chatNotificationData?.unReadChats",
        chatNotificationData?.unReadChats
      );
      dispatch(
        handleChatNotification({
          data: chatNotificationData.unReadChats,
          operation: "set",
        })
      );
    }
  }, [chatNotificationLoading]);

  useEffect(() => {
    if (nData?.unSeenNotifications) {
      dispatch(setUnSeenNotifications(nData?.unSeenNotifications));
    }
  }, [nData]);

  return (
    <div
      ref={sideNavbarRef}
      className={
        openSideNav && !router.asPath.startsWith("/direct/inbox")
          ? router.asPath.startsWith("/verifying") ||
            router.asPath.startsWith("/login") ||
            router.asPath.startsWith("/register") ||
            router.asPath.startsWith("/logout")
            ? `main-bg-color flex ai-start jc-sb f-d-c p-10 left-0 top-0 ${styles.Container} ${styles.hide___s}`
            : `main-bg-color flex ai-start jc-sb f-d-c p-10 left-0 top-0 ${styles.Container} ${styles.open}`
          : `$main-bg-color flex ai-start jc-sb f-d-c p-10 left-0 top-0 ${styles.Container} ${styles.close}`
      }
    >
      <div style={{ width: "100%" }}>
        <div className="fd flex ai-center jc-center">
          {openSideNav && !router.asPath.startsWith("/direct/inbox") ? (
            <h2 className="heading primary-text-color">ShareSpace</h2>
          ) : (
            <Image
              className="u"
              priority={true}
              width={31}
              height={31}
              src={"/logo2.png"}
              alt="logo"
            />
          )}
          <Image
            className="logo-Img"
            priority={true}
            width={31}
            height={31}
            src={"/logo2.png"}
            alt="logo"
          />
        </div>
        <div className={styles.Navigation_Options}>
          <Link
            href={"/"}
            style={{ textDecoration: "none" }}
            onClick={() => {
              dispatch(handleUserSearch(false));
              dispatch(handleOpenSideNav(true));
              dispatch(handleViewProfile(false));
              dispatch(setSelectedChat(Chat));
              dispatch(handleNotificationBar(false));
            }}
          >
            <div
              className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            >
              {router.asPath === "/" && !openNotificationBar ? (
                <GoHomeFill style={{ fontSize: "30px" }} />
              ) : (
                <GoHome style={{ fontSize: "30px" }} />
              )}
              <p>Home</p>
            </div>
          </Link>

          <div
            onClick={handleNavbarsFunctionality}
            className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            style={
              router.asPath.startsWith("/search")
                ? { border: "2px solid white" }
                : { border: "none" }
            }
          >
            <BiSearch style={{ fontSize: "30px" }} />
            <p>Search</p>
          </div>

          <Link
            href={"/reels"}
            style={{ textDecoration: "none" }}
            onClick={() => {
              dispatch(handleUserSearch(false));
              dispatch(handleOpenSideNav(true));
              dispatch(handleViewProfile(false));
              dispatch(handleNotificationBar(false));
            }}
          >
            <div
              className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            >
              {router.asPath.startsWith("/reels") ? (
                <BiSolidMoviePlay style={{ fontSize: "30px" }} />
              ) : (
                <BiMoviePlay style={{ fontSize: "30px" }} />
              )}
              <p>Reels</p>
            </div>
          </Link>

          <Link
            href={"/direct/inbox"}
            style={{ textDecoration: "none" }}
            onClick={() => {
              dispatch(handleUserSearch(false));
              dispatch(handleOpenSideNav(false));
              dispatch(handleViewProfile(false));
              dispatch(handleNotificationBar(false));
            }}
          >
            <div
              className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            >
              {router.asPath.startsWith("/direct/inbox") ? (
                <BsSendFill
                  style={{ fontSize: "25px", transform: " rotate(14deg)" }}
                />
              ) : (
                <BsSend
                  style={{ fontSize: "25px", transform: " rotate(14deg) " }}
                />
              )}
              {unSeenChats.length <= 0 ? null : (
                <span className={styles.notification}>
                  {unSeenChats.length}
                </span>
              )}
              <p>Messages</p>
            </div>
          </Link>

          <div
            className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            style={{ position: "-moz-initial" }}
            onClick={() => {
              dispatch(handleNotificationBar(!openNotificationBar));
              dispatch(handleOpenSideNav(openNotificationBar));
              dispatch(handleUserSearch(false));
            }}
          >
            <div style={{ position: "relative", height: "100%" }}>
              {unSeenNotifications.length > 0 ? (
                <span className={styles.notification_heart}>
                  {unSeenNotifications.length}
                </span>
              ) : null}
              {openNotificationBar ? (
                <GoHeartFill
                  style={{
                    fontSize: "31px",
                  }}
                />
              ) : (
                <GoHeart
                  style={{
                    fontSize: "31px",
                  }}
                />
              )}
            </div>
            <p>Notifications</p>
          </div>

          <div
            className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            onClick={() => {
              dispatch(handleOpenCreatePost(true));
              dispatch(handleViewProfile(false));
              dispatch(handleNotificationBar(false));
            }}
          >
            {router.asPath.startsWith("/create") ? (
              <IoIosAddCircle style={{ fontSize: "30px" }} />
            ) : (
              <IoIosAddCircleOutline style={{ fontSize: "30px" }} />
            )}
            <p>Create</p>
          </div>

          <Link href={"/saved"} style={{ textDecoration: "none" }}>
            <div
              className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
              onClick={() => {
                dispatch(handleViewProfile(false));
                dispatch(handleOpenSideNav(true));
                handleUserSearch(false);
                dispatch(handleNotificationBar(false));
              }}
            >
              {router.asPath.startsWith("/saved") ? (
                <FaBookmark
                  style={{
                    fontSize: "22px",
                    marginLeft: "4px",
                  }}
                />
              ) : (
                <FaRegBookmark
                  style={{
                    fontSize: "22px",
                    marginLeft: "4px",
                  }}
                />
              )}
              <p>Saved</p>
            </div>
          </Link>

          <Link
            href={`/profile/${loggedInUser.username}`}
            style={{ textDecoration: "none" }}
            onClick={() =>
              handleNavigation(loggedInUser.username, loggedInUser.id)
            }
          >
            <div
              className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
            >
              <img src={loggedInUser.profilePic} alt="" />
              <p>Profile</p>
            </div>
          </Link>
        </div>
      </div>

      <Link
        href={"/logout"}
        style={{ textDecoration: "none", width: "100%" }}
        rel="preload"
        onClick={() => {
          handleUserSearch(false);
          handleNotificationBar(false);
        }}
      >
        <div
          className={`w-100 p-10 m-t-10 br-10 of-hidden flex ai-center jc-start primary-text-color c-pointer relative ${styles.Options}`}
        >
          <MdLogout style={{ fontSize: "25px", marginLeft: "7px" }} />
          <p style={{ color: "white" }}>Logout</p>
        </div>
      </Link>
    </div>
  );
};

export default SideNavbar;
