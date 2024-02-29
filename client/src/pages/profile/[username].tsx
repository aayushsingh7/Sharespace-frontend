import { FC, useState, useEffect, useMemo } from "react";
import styles from "@/styles/Profile.module.css";
import { BsFillShieldLockFill, BsGrid3X3 } from "react-icons/bs";
import { BiMoviePlay } from "react-icons/bi";
import { PiCameraThin } from "react-icons/pi";
import { handleOpenCreatePost } from "@/slice/postSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { IoIosAddCircleOutline } from "react-icons/io";
import { AiOutlineMenu } from "react-icons/ai";
import {
  handleFollowersBox,
  handleFollowingBox,
  handleLoadingTask,
  handleShowMoreOptions,
} from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { CHATS, GET_USER, USER_POSTS, USER_REELS } from "@/graphQl/queries";
import { ChatType, PostType, ReelType } from "@/types/types";
import {
  CANCLE_FOLLOW_REQUEST,
  FOLLOW_USER,
  UNFOLLOW_USER,
} from "@/graphQl/mutations";
import { CHAT } from "@/graphQl/queries";
import io from "socket.io-client";
import {
  handleSelectedUser,
  setLoadedUserPosts,
  setLoadedUserReels,
  setSelectedUserPosts,
  setSelectedUserReels,
} from "@/slice/selectedUserSlice";
import { followUserFunction } from "@/utils/FollowUser";
import { unFollowUserFunction } from "@/utils/UnFollowUser";
import { addNewChat, setSelectedChat } from "@/slice/chatSlice";
import Head from "next/head";
import ProfileLoadingTemplate from "@/components/profileLodingTemplate";
import cancleFollowRequest from "@/utils/cancleFollowRequest";
import dynamic from "next/dynamic";
import Image from "next/image";
import VisibleElementTracker from "@/components/VisibleElementTracker";
import bottomNotification from "@/utils/handleBottomNotification";
const ProfilePostAndReelBox = dynamic(
  () => import("@/components/ProfilePostAndReelBox"),
  {
    ssr: false,
  }
);

interface ProfileProps {}

const Profile: FC<ProfileProps> = ({}) => {
  const client = useApolloClient();
  const [toggle, setToggle] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [reelsLoading, setReelsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const selectedUser = useSelector(
    (state: RootState) => state.selectedUser.selectedUser
  );

  const selectedUserPosts: PostType[] = useSelector(
    (state: RootState) => state.selectedUser.selectedUserPosts
  );
  const selectedUserReels: ReelType[] = useSelector(
    (state: RootState) => state.selectedUser.selectedUserReels
  );
  const token = useSelector((state: RootState) => state.more.token);
  const [followUserMutation] = useMutation(FOLLOW_USER);
  const [unFollowUserMutation] = useMutation(UNFOLLOW_USER);
  const [offset, setOffset] = useState<number>(0);
  const [socketState, setSocketState] = useState<any>();
  const [postOffset, setPostOffset] = useState<number>(0);
  const [reelOffset, setReelOffset] = useState<number>(0);
  const [accessAllowed, setAccessAllowed] = useState<boolean>(false);
  const [cancleFollowRequestMutation] = useMutation(CANCLE_FOLLOW_REQUEST);
  const user = useMemo(() => selectedUser, [selectedUser]);

  const router = useRouter();
  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );
  const chats = useSelector((state: RootState) => state.chat.chats);

  useEffect(() => {
    const socket = io("https://api-sharesapce-backend.onrender.com/");

    setSocketState(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const {
    loading: chatLoading,
    data: chatData,
    error: chatError,
    refetch: chatRefetch,
  } = useQuery(CHAT, {
    variables: {
      // @ts-ignore
      users: [selectedUser.id, loggedInUser.id],
      loggedInUser: loggedInUser.id,
      isGroupChat: false,
    },
    skip: selectedChat.id === "",
  });

  const {
    loading: pLoading,
    data: pData,
    error: pError,
  } = useQuery(USER_POSTS, {
    variables: { userId: selectedUser?.id, offset: postOffset },
    // @ts-ignore
    skip: selectedUser?.id === "",
    fetchPolicy:"network-only"
  });

  const {
    loading: rLoading,
    data: rData,
    error: rError,
    refetch: reelsFetch,
  } = useQuery(USER_REELS, {
    variables: { userId: selectedUser?.id, offset: reelOffset },
    // @ts-ignore
    skip: selectedUser?.id === "" || !toggle,
    fetchPolicy:"network-only"
  });

  const loadReels = async () => {
    if (selectedUserReels.length > 0) return;
    setReelsLoading(true);
    await reelsFetch().then(({ data }) => {
      if (data?.userReels && !rLoading) {
        if (selectedUserReels.length <= 0) {
          dispatch(setSelectedUserReels(data.userReels));
        } else {
          if (data.userReels && Array.isArray(data.userReels)) {
            const isPresent = data?.userReels.every((reel: ReelType) =>
              selectedUserReels.some((r) => r.id === reel.id)
            );
            if (!isPresent) {
              dispatch(setLoadedUserReels(data.userReels));
            }
          }
        }
        setReelsLoading(false);
      }
    });
  };

  useEffect(() => {
    setToggle(false);
    setPostOffset(0);
    setReelOffset(0);
  dispatch(setSelectedUserPosts([]))
  dispatch(setSelectedUserReels([]))
  }, [selectedUser.username]);

  useEffect(() => {
    setPostsLoading(true);

    if (pLoading) {
      return;
    }
    if (pError) {
      bottomNotification(dispatch, "Cannot get posts, try again later");
    } else {
      if (
        pData?.userPosts &&
        !pLoading &&
        pData?.userPosts !== selectedUserPosts
      ) {
        if (selectedUserPosts.length < 6) {
          console.log(1)
          // window.alert("1")
          dispatch(setSelectedUserPosts(pData.userPosts));
        } else {
          if( selectedUserPosts.length < selectedUser?.posts.length){
            // window.alert("2")
            console.log(2)
            dispatch(setLoadedUserPosts(pData.userPosts))
          }
        }
        setTimeout(()=> {
          setPostsLoading(false);
        },500)
      }
    }
  }, [pData]);

  
  const getChat = async () => {
    dispatch(handleLoadingTask(true));
    await chatRefetch()
      .then(({ data }) => {
        if (data?.chat) {
          console.log("--------------------------------------------------------",data?.chat)
          dispatch(setSelectedChat(data?.chat));
          
          // @ts-ignore
          let isChatExists = chats.find((chat) => chat.id === data?.chat.id);
          console.log("inside isChatExists", isChatExists);
          if (!isChatExists) {
            console.log("!isChatExists", isChatExists);
            socketState.emit("NEW_CHAT_CREATED", data?.chat);
            updateCache(data?.chat);
          }
          dispatch(handleLoadingTask(false));
          dispatch(addNewChat(data?.chat))
          router.push("/direct/inbox");
        }
      })
      .catch((err) => bottomNotification(dispatch, "Something went wrong"));
  };

  const updateCache = async (chat: ChatType) => {
    // @ts-ignore
    const data = client.readQuery({
      query: CHATS,
      variables: {
        userId: loggedInUser.id,
      },
    });

    if (!data) return;
    const updatedData = [chat, ...data?.chats];

    client.writeQuery({
      query: CHATS,
      variables: {
        userId: loggedInUser.id,
      },
      data: {
        chats: updatedData,
      },
    });
  };

  const {
    loading: uLoading,
    data: uData,
    error: uError,
    refetch: uRefetch,
  } = useQuery(GET_USER, {
    variables: { username: router.query.username },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    dispatch(handleLoadingTask(uLoading));
  }, [uLoading]);

  useEffect(() => {
    setUserLoading(true);

    if (uData?.user && !uLoading) {
      // client.writeQuery({
      //   query: GET_USER,
      //   variables: { username: router.query.username },
      //   data: {
      //     user: uData?.user,
      //   },
      // });
      dispatch(handleSelectedUser(uData.user));

      setUserLoading(false);
      // if (postsLoading) {

      //   setPostsLoading(false);
      // }
    }
  }, [uData?.user]);

  useEffect(() => {
    if (uData) {
      const isPrivate = uData.user.accountType === "private";
      const isNotFollowing = !loggedInUser.following.includes(uData.user.id);
      const isNotSameUser = uData.user.id !== loggedInUser.id;

      if (isPrivate && isNotFollowing && isNotSameUser) {
        setAccessAllowed(false);
      } else {
        setAccessAllowed(true);
      }
    }
  }, [uData]);

  const isFollowingUser = selectedUser?.followers?.includes(loggedInUser.id);

  console.log(selectedUserPosts.length, selectedUser?.posts.length);

  return (
    <>
      <Head>
        <title>
          {selectedUser?.username === loggedInUser.username
            ? `@${selectedUser.username} • ShareSpace photos and videos`
            : selectedUser?.name.length > 0
            ? ` ${selectedUser?.name} (@${selectedUser.username})`
            : `@${selectedUser.username}`}
        </title>
      </Head>
      <div
        className={`wwyyxx w-100 h-100 of-y-scroll flex ai-start jc-center main-bg-color of-x-hidden ${styles.f}`}
      >
        <div
          className={`main-bg-color w-100 fixed zi-10 ai-center jc-sb ${styles.Mob_Profile_Navbar}`}
        >
          <p className="fs-large primary-text-color fw-600">
            {selectedUser?.username}
          </p>
          <div>
            <IoIosAddCircleOutline
              onClick={() => dispatch(handleOpenCreatePost(true))}
              style={{ fontSize: "30px", color: "white", marginRight: "20px" }}
            />
            <AiOutlineMenu
              style={{ fontSize: "30px", color: "white" }}
              onClick={() => dispatch(handleShowMoreOptions(true))}
            />
          </div>
        </div>
        <div
          className={`w-100 h-100 flex ai-start jc-start f-d-c ${styles.Children}`}
        >
          {userLoading ? (
            <ProfileLoadingTemplate />
          ) : (
            <>
              <div className={`flex ai-start jc-sb ${styles.Header}`}>
                <div
                  className={`relative of-hidden br-50-per ${styles.img_con_s}`}
                >
                  <Image fill={true} src={selectedUser?.profilePic} alt="" />
                </div>
                <div className={styles.UserInfo}>
                  <div
                    className={`flex ai-center jc-start ${styles.UserInfo_header}`}
                  >
                    <p className="fs-large primary-text-color">
                      {selectedUser?.username}
                    </p>
                    {loggedInUser.username === selectedUser?.username ? (
                      <Link
                        href={"/account/edit/"}
                        style={{ textDecoration: "none", marginLeft: "25px" }}
                      >
                        <button
                          className={`btn fw-600 primary-text-color c-pointer dark-mid-bg-color ${styles.edit_btn} `}
                        >
                          Edit profile
                        </button>
                      </Link>
                    ) : (
                      <div
                        className="flex ai-center jc-center w-100"
                        style={{ marginLeft: "25px" }}
                      >
                        {selectedUser?.requests.includes(loggedInUser.id) ? (
                          <button
                          className={`btn primary-text-color  fw-600 dark-mid-bg-color fs-m-small br-10 c-pointer w-100`}
                          style={{
                            marginRight: "10px",
                            padding: "10px 20px",
                            marginLeft: "0xp",
                            minWidth: "110px",
                          }}
                            onClick={() =>
                              cancleFollowRequest(
                                dispatch,
                                cancleFollowRequestMutation,
                                selectedUser,
                                loggedInUser,
                                socketState
                              )
                            }
                          >
                            Requested
                          </button>
                        ) : (
                          <>
                            (
                            <button
                              className={`btn primary-text-color  fw-600  ${
                                isFollowingUser
                                  ? "dark-mid-bg-color"
                                  : "highlight-bg-color"
                              } fs-m-small br-10 c-pointer w-100`}
                              style={{
                                marginRight: "5px",
                                padding: "10px 20px",
                                marginLeft: "0xp",
                                minWidth: "110px",
                              }}
                              onClick={() =>
                                isFollowingUser
                                  ? unFollowUserFunction(
                                      false,
                                      token,
                                      dispatch,
                                      loggedInUser,
                                      selectedUser,
                                      unFollowUserMutation
                                    )
                                  : followUserFunction(
                                      token,
                                      dispatch,
                                      loggedInUser,
                                      selectedUser,
                                      followUserMutation,
                                      socketState
                                    )
                              }
                            >
                              {isFollowingUser ? "Following" : "Follow"}
                            </button>
                            )
                          </>
                        )}
                            <button
                              onClick={getChat}
                              className="btn fw-600 primary-text-color  dark-mid-bg-color fs-m-small br-10 c-pointer w-100"
                              style={{
                                marginRight: "7px",
                                padding: "10px 20px",
                                marginLeft: "0xp",
                              }}
                            >
                              Message
                            </button>
                      </div>
                    )}
                  </div>

                  <div className="w-100 flex ai-center jc-sb fs-m-normal m-t-30 primary-text-color">
                    <p style={{ marginRight: "20px" }}>
                      {selectedUser?.posts?.length +
                        selectedUser?.reels?.length}{" "}
                      posts
                    </p>

                    <p
                      style={
                        accessAllowed
                          ? { marginRight: "20px", cursor: "pointer" }
                          : { marginRight: "20px" }
                      }
                      onClick={() =>
                        accessAllowed
                          ? dispatch(handleFollowersBox(true))
                          : null
                      }
                    >
                      {selectedUser?.followers?.length} followers
                    </p>

                    <p
                      style={
                        accessAllowed
                          ? { cursor: "pointer" }
                          : { cursor: "auto" }
                      }
                      onClick={() =>
                        accessAllowed
                          ? dispatch(handleFollowingBox(true))
                          : null
                      }
                    >
                      {selectedUser?.following?.length} following
                    </p>
                  </div>

                  <pre className={styles.Bio}>{selectedUser?.bio}</pre>
                  <a
                    style={{ textDecoration: "none", color: "#0095ff" }}
                    href={`${loggedInUser.link}`}
                  >
                    {loggedInUser.link}
                  </a>
                </div>
              </div>

              <div
                className={`flex ai-start jc-sb ${styles.Header} ${styles.mob}`}
              >
                <div className={`flex ai-center jc-sb w-100 ${styles.pad}`}>
                  <div
                    className={`relative of-hidden br-50-per ${styles.img_con_s} ${styles.mob_img}`}
                  >
                    <Image fill={true} src={selectedUser?.profilePic} alt="" />
                  </div>

                  <div className="flex ai-center jc-center">
                    <div
                      className={`flex ai-center jc-center f-d-c ${styles.Cllasdj}`}
                    >
                      <p
                        className={styles.Bold_p}
                        style={{ marginBottom: "1px" }}
                      >
                        {selectedUser?.posts?.length +
                          selectedUser?.reels?.length}
                      </p>
                      <p>Posts</p>
                    </div>

                    <div
                      className={`flex ai-center jc-center f-d-c ${styles.Cllasdj}`}
                      style={
                        accessAllowed
                          ? { cursor: "pointer" }
                          : { cursor: "auto" }
                      }
                      onClick={() =>
                        accessAllowed
                          ? dispatch(handleFollowersBox(true))
                          : null
                      }
                    >
                      <p className={styles.Bold_p}>
                        {selectedUser?.followers?.length}
                      </p>
                      <p>Followers</p>
                    </div>

                    <div
                      className={`flex ai-center jc-center f-d-c ${styles.Cllasdj}`}
                      style={
                        accessAllowed
                          ? { cursor: "pointer" }
                          : { cursor: "auto" }
                      }
                    >
                      <p className={styles.Bold_p}>
                        {selectedUser?.following?.length}
                      </p>
                      <p
                        onClick={() =>
                          accessAllowed
                            ? dispatch(handleFollowingBox(true))
                            : null
                        }
                      >
                        Following
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex ai-start jc-start m-t-20 primary-text-color w-100 ${styles.Mob_Bio}`}
                >
                  {selectedUser?.bio}
                </div>

                <div
                  className={`flex ai-center jc-center w-100 m-t-15 ${styles.Button_Options_Container}`}
                >
                  {loggedInUser.username === selectedUser.username &&
                  !userLoading ? (
                    <Link
                      href={"/account/edit/"}
                      style={{ textDecoration: "none", width: "100%" }}
                    >
                      <button
                        className="btn fw-600 primary-text-color dark-mid-bg-color fs-m-small br-10 c-pointer w-100"
                        style={{
                          marginRight: "7px",
                          padding: "10px 20px",
                          marginLeft: "0xp",
                        }}
                      >
                        Edit profile
                      </button>
                    </Link>
                  ) : (
                    <>
                      (
                      <button
                        className={`btn primary-text-color  fw-600  ${
                          isFollowingUser
                            ? "dark-mid-bg-color"
                            : "highlight-bg-color"
                        } fs-m-small br-10 c-pointer w-100`}
                        style={{
                          marginRight: "10px",
                          padding: "10px 20px",
                          marginLeft: "0xp",
                        }}
                        onClick={() =>
                          isFollowingUser
                            ? unFollowUserFunction(
                                false,
                                token,
                                dispatch,
                                loggedInUser,
                                selectedUser,
                                unFollowUserMutation
                              )
                            : followUserFunction(
                                token,
                                dispatch,
                                loggedInUser,
                                selectedUser,
                                followUserMutation,
                                socketState
                              )
                        }
                      >
                        {isFollowingUser ? "Following" : "Follow"}
                      </button>
                      )
                      <button
                        onClick={getChat}
                        className="btn  primary-text-color  dark-mid-bg-color fs-m-small br-10 c-pointer w-100"
                        style={{
                          marginRight: "7px",
                          padding: "10px 20px",
                          marginLeft: "0xp",
                        }}
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {!accessAllowed && !userLoading ? (
            <div className={styles.private_account_padding}>
              <div
                className={`flex ai-center jc-center w-100 b-light f-d-c br-10 ${styles.Private_Account}`}
              >
                <BsFillShieldLockFill />
                <p style={{ marginTop: "30px" }}>This Account is Private</p>
                <p>Follow to see their photos and videos</p>
              </div>
            </div>
          ) : (
            <div className={`w-100 h-100 b-top-light m-t-30 flex f-d-c`}>
              <div className="flex ai-center jc-center w-100">
                <div
                  className={`flex ai-center jc-center p-20 c-pointer relative ${
                    !toggle ? styles.active : ""
                  }`}
                  style={{ margin: "0px 10px" }}
                  onClick={() => setToggle(false)}
                >
                  <BsGrid3X3 style={{ fontSize: "13px", marginRight: "6px" }} />
                  <p className={styles.p}>POSTS</p>
                </div>

                {selectedUser.reels.length <= 0 ? null : (
                  <div
                    className={`flex ai-center jc-center p-20 c-pointer relative ${
                      toggle ? styles.active : ""
                    }`}
                    style={{ margin: "0px 10px" }}
                    onClick={() => {
                      setToggle(true);
                      loadReels();
                    }}
                  >
                    <BiMoviePlay
                      style={{ fontSize: "17px", marginRight: "6px" }}
                    />
                    <p className={styles.p}>REELS</p>
                  </div>
                )}
              </div>

              {selectedUser?.posts.length <= 0 &&
              !postsLoading &&
              !userLoading ? (
                <div className="w-100 h-100 flex ai-center jc-center template f-d-c ">
                  <PiCameraThin />
                  <p className="primary-text-color">No Post Yet</p>
                </div>
              ) : (
                <div className={styles.Posts_Container}>
                  {userLoading ||
                  (postsLoading && selectedUserPosts.length <= 0) ? (
                    <>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                      <div className={`${styles.Box} ${styles.loading}`}></div>
                    </>
                  ) : toggle ? (
                    reelsLoading ? (
                      <>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                        <div
                          className={`${styles.Box} ${styles.loading}`}
                        ></div>
                      </>
                    ) : (
                      selectedUserReels?.map((reel) => {
                        return (
                          <ProfilePostAndReelBox key={reel.id} reel={reel} />
                        );
                      })
                    )
                  ) : (
                    selectedUserPosts?.map((post) => {
                      return (
                        <ProfilePostAndReelBox key={post.id} post={post} />
                      );
                    })
                  )}
                </div>
              )}

              {!toggle ? (
                selectedUserPosts.length > selectedUser?.posts.length ||
                selectedUserPosts.length == selectedUser?.posts.length || 
                postsLoading   ? null : (
                
                    <VisibleElementTracker
                      offset={postOffset}
                      setOffset={setPostOffset}
                      page="profile"
                    />
            
                )
              ) : selectedUserReels.length === selectedUser?.reels.length ||
                reelsLoading ? null : (
                
                  <VisibleElementTracker
                    offset={reelOffset}
                    setOffset={setReelOffset}
                    page="profile"
                  />
                
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
