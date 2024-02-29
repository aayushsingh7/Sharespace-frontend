import { FC, useEffect, useState } from "react";
import ChatBox from "@/components/ChatBox";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ChatType, UserType } from "@/types/types";
import LoadingBox from "@/components/LoadingBox";
import { useQuery } from "@apollo/client";
import { SEARCH_USERS } from "@/graphQl/queries";
const UserBox = dynamic(()=> import("@/components/UserBox"),{ssr:false})
import { ClipLoader } from "react-spinners";
import { handleUserSearch } from "@/slice/navbarSlice";
import { SiGooglemessages } from "react-icons/si";
import dynamic from "next/dynamic";

interface ChatLayoutProps {
  loading: boolean;
  socket: any;
}

const ChatLayout: FC<ChatLayoutProps> = ({ loading, socket }) => {
  const openChat = useSelector((state: RootState) => state.chat.openChat);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const selectedChat = useSelector((state:RootState)=> state.chat.selectedChat)

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserType[]>();
  const dispatch = useDispatch();

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
    refetch,
  } = useQuery(SEARCH_USERS, {
    variables: {
      username:loggedInUser.username,
      query: searchQuery,
    },
    //@ts-ignore
    skip: searchQuery.trim().length <= 0,
  });

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        await refetch().then(({ data }) => {
          setSearchResults(data.searchUsers);
        });
      } catch (err) {
      window.alert("!Oops something went wrong")
      }
    };
    if (searchQuery !== "") {
      getSearchResults();
    }
  }, [searchQuery]);

  return (
    <div
      className={`chats-container h-100dvh w-100vw-custom main-bg-color b-right relative flex ai-start jc-start f-d-c ${
        openChat ? "hide-container" : "show-container"
      }`}
    >
      <div
        className="flex ai-start jc-start f-d-c primary-text-color w-100"
        style={{ marginTop: "30px", padding: "0px 20px" }}
      >
        <h3 className="fs-large handle-view" style={{ marginBottom: "30px" }}>
          {loggedInUser.username}
        </h3>
        <SiGooglemessages className="svg-msg primary-text-color" />

        <div
          className="chats-search-user display-none ai-center jc-center f-d-c w-100 relative of-auto"
          style={{ marginBottom: "20px" }}
        >
          {
            <input
              className="btn br-10 w-100 primary-text-color dadad dark-bg-color"
              type="text"
              placeholder="Search users"
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="new-text"
              style={
                //@ts-ignore
                searchQuery?.length > 0
                  ? {
                      borderBottomLeftRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }
                  : {
                      borderBottomLeftRadius: "10px",
                      borderBottomRightRadius: "10px",
                    }
              }
            />
          }

          {
            //@ts-ignore
            searchQuery?.length > 0 ? (
              <div className="ai-center flex jc-start f-d-c w-100 dark-bg-color absolute b-top of-auto chats-search-user-result zi-10">
                {
                  //@ts-ignore
                  queryLoading ? (
                    <p style={{ padding: "" }}>
                      {" "}
                      <ClipLoader
                        color={"#f1f1f1"}
                        loading={true}
                        size={45}
                        // cssOverride={override}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </p>
                  ) : //@ts-ignore
                  searchResults?.length <= 0 ? (
                    <p style={{ padding: "10px 0px 15px 0px" }}>
                      No user found
                    </p>
                  ) : (
                    searchResults?.map((user: UserType) => {
                      return (
                        <UserBox
                          followBtn={false}
                          data={user}
                          hover={true}
                          key={user.id}
                        />
                      );
                    })
                  )
                }
              </div>
            ) : null
          }
        </div>

        <div className="flex ai-center jc-sb w-100 handle-view">
          <p className="fs-m-normal fw-600 primary-text-color">Messages</p>
          <button className="btn secondary-text-color c-pointer fw-600 fs-m-small bg-none">
            {loggedInUser.requests.length} Requests
          </button>
        </div>
      </div>

      <div
        className="chats w-100 h-100 of-y-scroll flex-grow"
        style={{ marginTop: "12px" }}
      >
        {loading ? (
          <div style={{ width: "100%" }}>
            <LoadingBox />
            <LoadingBox />
            <LoadingBox />
            <LoadingBox />
            <LoadingBox />
            <LoadingBox />
          </div>
        ) : chats.length <= 0 && !loading ? (
          <div className="template flex ai-center jc-center f-d-c w-100 flex-1">
            <p className="fs-large primary-text-color">No Chats Found</p>
            <button
              className="btn primary-text-color highlight-bg-color br-10 c-pointer m-t-15"
              onClick={() => dispatch(handleUserSearch(true))}
            >
              Start Chatting
            </button>
          </div>
        ) : (
          chats.filter((chat: ChatType) => {
            return chat.id === selectedChat.id || chat.messages.length > 0;
          }).map((chat: ChatType) => {
            return (
              <ChatBox hover={true} key={chat.id} data={chat} socket={socket} />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
