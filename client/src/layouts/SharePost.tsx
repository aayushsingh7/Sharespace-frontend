import LoadingBox from "@/components/LoadingBox";
import { NEW_MESSAGE } from "@/graphQl/mutations";
import { CHATS, SEARCH_USERS, SUGGESTED } from "@/graphQl/queries";
import { addNewMessage, sendingNewMessage, updateChat } from "@/slice/chatSlice";
import { handleLoadingTask } from "@/slice/moreSlice";
import { handleSharePost } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import { ChatType, UserType } from "@/types/types";
import { getSecondUser } from "@/utils/getSecondUser";
import getUniqueId from "@/utils/getUniqueID";
import bottomNotification from "@/utils/handleBottomNotification";
import handleMessageCacheAndStatus from "@/utils/handleMessageCacheAndStatus";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import dynamic from "next/dynamic";
import { FC, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { TbMessage2Search } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
const SuggestionUserBox = dynamic(
  () => import("@/components/SuggestionUserBox"),
  { ssr: false }
);

interface SharePostProps {}

const SharePost: FC<SharePostProps> = ({}) => {
  const [selectChatLoading, setSelectChatLoading] = useState<boolean>(false);
  const sharePost = useSelector((state: RootState) => state.post.sharePost);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  const [query, setQuery] = useState<string>("");

  const [searchResults, setSearchResults] = useState<UserType[]>();
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [selectedChats, setSelectedChats] = useState<any[]>([]);
  const requestProcessing = useRef<boolean>(false);
  const client = useApolloClient();
  const messageQueue = useRef<any[]>([]);

  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );
  const [addNewMessageMutation] = useMutation(NEW_MESSAGE);
  const [socketState, setSocketState] = useState<any>(null);

  useEffect(() => {
    if (sharePost) {

      const socket = io("https://api-sharesapce-backend.onrender.com/");

      socket.on("connect", () => {
        console.log("Connected to SOCKET.IO server in SharePost component ");
      });

      // socket.on("NEW_MESSAGE", (newMessage, chat) => {
      //   dispatch(
      //     addNewMessage({
      //       newMessage: newMessage,
      //       chat: {
      //         id: chat.id,
      //       },
      //     })
      //   );
      //   dispatch(updateChat("update"));
      // });

      setSocketState(socket);

      return () => {
        socket.disconnect();
        console.log("disconnected on the socket in sharepost")
      };
    }
  }, [sharePost]);

  const { loading, data:searchUsersData, error, refetch } = useQuery(SEARCH_USERS, {
    variables: {
      username:loggedInUser.username,
      query: query,
    },
    skip: query === "",
  });

  const {
    loading: suggestedLoading,
    data: suggestedData,
    error: suggestedError,
  } = useQuery(SUGGESTED, {
    variables: {
      userId: loggedInUser.id,
    },
    skip: sharePost === false,
  });

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        await refetch().then(({ data }) => {
          setSearchResults(data.searchUsers);
        });
      } catch (err) {
        console.log(err);
      }
    };
    if (query !== "") {
      getSearchResults();
    }
  }, [query]);

  
  const handleMessageRequests = async () => {

    const newMessage = {
      messageId: getUniqueId(),
      user: {
        id: loggedInUser.id,
        username: loggedInUser.username,
        name: loggedInUser.name,
        profilePic: loggedInUser.profilePic,
      },
      text: selectedPost.uploadedData[0],
      createdAt: new Date().toISOString(),
      dataType: selectedPost.dataType,
      replys: [],
      reaction: "",
      deleted: false,
      seenBy: [loggedInUser.id],
      postInfo: {
        postedBy: {
          ...selectedPost.postedBy,
        },
        dataType:selectedPost.dataType,
        id:selectedPost.id,
        uploadedData: selectedPost.uploadedData,
        description: selectedPost.description,
      },
      status:"sending",
    };


      messageQueue.current = [...messageQueue.current, newMessage];

      
      selectedChats.map((chat)=> {
        console.log("chat___________________________________________",chat)
        handleMessageCacheAndStatus(client, "sending", chat, newMessage);
              dispatch(
                sendingNewMessage({ newMessage: newMessage, chat: chat })
              );
      })
    
    
      console.log("selected chat",selectedChat)

    if (messageQueue.current.length > 0 && !requestProcessing.current) {
      const currentMsg = messageQueue.current[0];
      console.log(
        "check point 2, checking: messageQueue.current.length > 0 && !requestProcessing.current",
        messageQueue.current,
        requestProcessing.current
      );
      await sendPostAndReelsData(currentMsg);
    } else {
      console.log("failed to meet the reqirements");
      return;
    }
  };

  const sendPostAndReelsData = async (newMessage:any) => {
    try {
      dispatch(handleLoadingTask(true));

      // selectedChats.map((chat)=> {
      //   console.log({newMessage:newMessage,chat:chat,loggedInUser:loggedInUser,getSecondUser:getSecondUser(chat.users,loggedInUser)})
      // })


      selectedChats.map(async (chat) => {

        
        console.log("selectedChat", chat, "getSecondUser:", getSecondUser(chat.users, loggedInUser))

        const response = await addNewMessageMutation({
          variables: {
            user: loggedInUser.id,
            chatId: chat.id,
            text: newMessage.text,
            dataType: newMessage.dataType,
            postId: selectedPost.id,
            uploaderUsername: selectedPost.postedBy.username,
            description: selectedPost.description,
            messageId: newMessage.messageId,
          },
          update(cache, { data } ) {

            
            messageQueue.current = messageQueue.current.filter((msg) => {
              return msg.messageId !== newMessage.messageId;
            });

            socketState.emit(
              "NEW_MESSAGE_SEND_TRIGGERED",
              data.newMessage,
             {...chat,latestMessage:data.newMessage},
              loggedInUser,
              getSecondUser(chat.users, loggedInUser),
              newMessage.messageId
            );


            console.log("jadlksjfal;djlfjadjfajsd;jfajdsklfjadjfk jadlf;jadsjfkajdl;kfjakdjsfajdfj a;sdfajdfkjad",data.newMessage)
        
        
  
          //   // @ts-ignore
          //   const data: any = cache.readQuery({
          //     query: CHATS,
          //     variables: {
          //       userId: loggedInUser.id,
          //     },
          //   });

          //   console.log("nothing found ____________________________________________________________",data?.chats)

          //   if (!data?.chats || data?.chats === undefined) return;

          //   console.log("inside  data?.chats");

          //   const updatedChats = data?.chats
          //     .map((chat: ChatType) => {
          //       const updatedAt =
          //         typeof chat.updatedAt === "string"
          //           ? parseInt(chat.updatedAt)
          //           : chat.updatedAt;

          //       return chat.id === selectedChat.id
          //         ? {
          //             ...chat,
          //             latestMessage: newMessage,
          //             messages: [...chat.messages, data.newMessage],
          //             updatedAt: new Date().getTime(),
          //           }
          //         : {
          //             ...chat,
          //             updatedAt,
          //           };
          //     })
          //     //@ts-ignore
          //     .sort((a, b) => b.updatedAt - a.updatedAt);

          //   cache.writeQuery({
          //     query: CHATS,
          //     variables: {
          //       userId: loggedInUser.id,
          //     },
          //     data: {
          //       chats: updatedChats,
          //     },
          //   });
          },
        });
        dispatch(handleLoadingTask(false));
        setSelectedUsers([]);
        setSelectedChats([]);
        dispatch(handleSharePost(false));
        bottomNotification(dispatch, "Message sent");

        const msgData = await response.data;

        console.log("------------------------------DONT TRY TO FOOL ME NIGGESH--------------------",msgData)



// handleMessageRequests()
      });
    } catch (err) {
      bottomNotification(
        dispatch,
        `Cannot send ${selectedPost?.dataType} at this moment, try again later`
      );
    }
  };

  useEffect(() => {
    console.log("Selected chats", selectedChats);
  }, [selectedChats]);

  return (
    <div
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
    >
      <div
        className={`dark-bg-color br-15 flex ai-start jc-start f-d-c sharepost-box`}
      >
        <div
          className="flex ai-center jc-sb b-bottom-light w-100"
          style={{ padding: "17px" }}
        >
          <span></span>
          <p className="fs-normal fw-600 primary-text-color">Share</p>
          <AiOutlineClose
            style={{ color: "white", fontSize: "23px" }}
            onClick={() => {
              dispatch(handleSharePost(false));
              setSelectedUsers([]);
              setSelectedChats([]);
            }}
          />
        </div>

        <div
          className="flex ai-start b-bottom-light jc-start w-100"
          style={{ padding: "15px" }}
        >
          <p style={{ color: "white", fontSize: "1.1rem", marginTop: "7px" }}>
            To:
          </p>
          <div className="flex ai-start jc-start" style={{ flexWrap: "wrap" }}>
            {selectedUsers?.map((user: any) => {
              return (
                <div
                  className={`flex ai-center jc-center primary-text-color m-l-10 sharepost-user-select`}
                  key={user.id}
                >
                  <p>{user.username}</p>
                </div>
              );
            })}
            <input
              className="btn primary-text-color fs-m-normal flex-1 bg-none"
              style={{ margin: "10px", marginTop: "1px", padding: "7px" }}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={true}
            />
          </div>
        </div>

        <div className="w-100 h-100 flex flex-grow ai-start jc-start of-y-scroll f-d-c no-scrollbar">
          {suggestedData?.suggested?.length <= 0 && !suggestedLoading ? null : (
            <p
              className="w-100 fs-m-small primary-text-color fw-600"
              style={{ padding: "14px 14px 14px 20px" }}
            >
              Suggested
            </p>
          )}

          {suggestedLoading || loading ? (
            <>
              <LoadingBox padding="10px 17px" />
              <LoadingBox padding="10px 17px" />
              <LoadingBox padding="10px 17px" />
              <LoadingBox padding="10px 17px" />
              <LoadingBox padding="10px 17px" />
            </>
          ) : query === "" ? (
            suggestedData?.suggested?.length <= 0 && !suggestedLoading ? (
              <div className="template">
                <TbMessage2Search />
              </div>
            ) : (
              suggestedData?.suggested?.map((chat: ChatType) => {
                return (
                  <SuggestionUserBox
                    data={chat}
                    dataType={"chat"}
                    key={chat.id}
                    setSelectedUsers={setSelectedUsers}
                    selectedUsers={selectedUsers}
                    setSelectedChats={setSelectedChats}
                    handleLoading={setSelectChatLoading}
                  />
                );
              })
            )
          ) : (
            searchResults?.map((user: UserType) => {
              return (
                <SuggestionUserBox
                  key={user.id}
                  data={user}
                  dataType={"user"}
                  setSelectedUsers={setSelectedUsers}
                  selectedUsers={selectedUsers}
                  setSelectedChats={setSelectedChats}
                  handleLoading={setSelectChatLoading}
                />
              );
            })
          )}
        </div>

        <div className="p-20 w-100 b-top-light">
          <button
            className="btn highlight-bg-color fs-m-normal primary-text-color c-pointer br-50 w-100"
            style={{
              padding: "13px",
              background: selectedChats.length <= 0 ? "#444" : undefined,
            }}
            onClick={
              selectedChats.length <= 0 || selectChatLoading
                ? undefined
                : handleMessageRequests
            }
          >
            {selectedChats.length <= 0
              ? "Select users to share"
              : selectChatLoading
              ? "Please wait..."
              : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePost;
