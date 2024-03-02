const Comment = dynamic(()=>  import("@/components/Comment"),{ssr:false})
import {
  ADD_COMMENT,
  ADD_LIKE,
  NEW_NOTIFICATION,
  REMOVE_LIKE,
  REPLY_ON_COMMENT,
  SAVE_POST,
  UNSAVE_POST,
} from "@/graphQl/mutations";
import { GET_COMMENTS, POST } from "@/graphQl/queries";
import {
  handleDeleteConfirmation,
  handleEditPost,
  handleLoadingTask,
  handleMute,
} from "@/slice/moreSlice";
import {
  addComment,
  addLike,
  addLoadedComments,
  addNewReply,
  addTempComment,
  addTemperoryReply,
  handleSelectedPost,
  handleSharePost,
  handleViewPost,
  removeLike,
  setComments,
} from "@/slice/postSlice";
import { savePost, unSavePost } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/ViewPost.module.css";
import { CommentType } from "@/types/types";
import getUniqueId from "@/utils/getUniqueID";
import savePostAndReels from "@/utils/savePostAndReels";
import unSavePostAndReels from "@/utils/unSavePostAndReels";
import { useMutation, useQuery } from "@apollo/client";
import { FC, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineClose, AiOutlineHeart } from "react-icons/ai";
import { FaBookmark, FaPlay, FaRegBookmark } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import {
  MdDelete,
  MdModeEditOutline,
  MdOutlineModeComment,
} from "react-icons/md";
import { TbSend } from "react-icons/tb";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import VisibleElementTracker from "@/components/VisibleElementTracker";
import manageLikeNotification from "@/utils/manageLikeNotification";
import Image from "next/image";
import { useRouter } from "next/router";
import { LiaCommentSolid } from "react-icons/lia";
import convertPostCreatedAt from "@/utils/convertPostCreatedAt";
import dynamic from "next/dynamic";

interface ViewPostProps {}

const ViewPost: FC<ViewPostProps> = ({}) => {
  const editPost = useSelector((state:RootState)=> state.more.openEditPost)
  const viewPost = useSelector((state: RootState) => state.post.viewPost);
  const dispatch = useDispatch();
  const [addCommentMutation] = useMutation(ADD_COMMENT);
  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  const selectedUser = useSelector(
    (state: RootState) => state.selectedUser.selectedUser
  );
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [commentText, setCommentText] = useState<string>("");
  const [socket, setSocket] = useState<any>();
  const selectedPostComments = useSelector(
    (state: RootState) => state.post.selectedPostComments
  );
  const selectedUserChanged = useSelector(
    (state: RootState) => state.selectedUser.selectedUserChanged
  );
  const [addLikeMutation] = useMutation(ADD_LIKE);
  const [commentLoading,setCommentLoading] = useState<boolean>(false)
  const [removeLikeMutation] = useMutation(REMOVE_LIKE);
  const [replyOnCommentMutation] = useMutation(REPLY_ON_COMMENT);
  const [replying, setReplying] = useState<boolean>(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [postLoadingState, setPostLoadingState] = useState<boolean>(true);
  const router = useRouter();
  const [commmentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<CommentType>();
  const [newNotificationMutation] = useMutation(NEW_NOTIFICATION);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isMuted = useSelector((state: RootState) => state.more.isMuted);
  const [unSavePostAndReelsMutation] = useMutation(UNSAVE_POST);
  const [savePostAndReelsMutation] = useMutation(SAVE_POST);
  const token = useSelector((state: RootState) => state.more.token);
  const videoRef = useRef(null);
  const [offset, setOffset] = useState<number>(0);
  const replyInputRef = useRef<any>(null);

  const {
    loading: cLoading,
    data: commentsData,
    error: commentsError,
    refetch,
  } = useQuery(GET_COMMENTS, {
    variables: {
      postId: selectedPost?.id,
      offset: offset,
    },
    skip: viewPost === false,
  })

useEffect(()=> {
 if(!viewPost){
setOffset(0)
}
},[viewPost])


  const {
    loading: postLoading,
    data: postData,
    error: postError,
  } = useQuery(POST, {
    variables: { dataType: selectedPost?.dataType, postId: selectedPost?.id },
    skip: !viewPost,
  });

  useEffect(() => {
    dispatch(handleLoadingTask(postLoading));
  }, [postLoading]);

  useEffect(() => {
    setPostLoadingState(true);
    if (postLoading) return;
    if (postError) return console.log(postError);
    if (postData?.post) {
      dispatch(handleSelectedPost(postData?.post));
      setPostLoadingState(false);
    }
  }, [postData, viewPost]);

  useEffect(() => {
    const getNewComments = async () => {
      try {
        await refetch().then(({ data }) => {
          if (data?.getComments) {
            dispatch(addLoadedComments(data?.getComments));
          }
        });
      } catch (err) {}
    };
    if (viewPost) {
      getNewComments();
    }
  }, [offset]);

  useEffect(() => {
    console.log("are yar bhai comments toh load ho rahe hi beti ");
    setCommentsLoading(true);
    if (commentsData?.getComments) {
      if (offset==0) {
        dispatch(setComments(commentsData?.getComments));
      }
      setCommentsLoading(false);
    }
  }, [cLoading]);

  useEffect(() => {
    const s = io("https://api-sharesapce-backend.onrender.com/");

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const addLikeFunction = async () => {
    try {
      dispatch(addLike(loggedInUser.id));

      const response = await addLikeMutation({
        variables: {
          dataType: selectedPost?.dataType,
          id: selectedPost?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          try {
            // @ts-ignore
            const { post } = cache.readQuery({
              query: POST,
              variables: {
                postId: selectedPost?.id,
                dataType: selectedPost?.dataType,
              },
            });

            cache.writeQuery({
              query: POST,
              variables: {
                postId: selectedPost?.id,
                dataType: selectedPost?.dataType,
              },
              data: {
                post: {
                  ...post,
                  likes: [...post.likes, loggedInUser?.id],
                },
              },
            });
          } catch (error) {}
        },
      });
      manageLikeNotification(
        socket,
        loggedInUser,
        selectedPost,
        newNotificationMutation,
        "post_and_reels_like",
        selectedComment
      );
      const data = await response.data;
    } catch (err) {
      // console.log(err)
    }
  };

  const removedLikeFunction = async () => {
    try {
      dispatch(removeLike(loggedInUser.id));
      const response = await removeLikeMutation({
        variables: {
          dataType: selectedPost?.dataType,
          id: selectedPost?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          // @ts-ignore
          const { post } = cache.readQuery({
            query: POST,
            variables: {
              postId: selectedPost?.id,
              dataType: selectedPost?.dataType,
            },
          });

          cache.writeQuery({
            query: POST,
            variables: {
              postId: selectedPost?.id,
              dataType: selectedPost?.dataType,
            },
            data: {
              post: {
                ...post,
                likes: post.likes.filter(
                  (uId: string) => uId !== loggedInUser.id
                ),
              },
            },
          });
        },
      });

      const data = await response.data;
    } catch (err) {}
  };

  const manageCommentNotification = async () => {
    try {
      if (selectedPost.postedBy.id === loggedInUser.id) return;

      let variables =
        selectedPost.dataType === "post"
          ? {
              receiverId: selectedPost.postedBy.id,
              senderId: loggedInUser.id,
              text: commentText,
              subject: "added comment to your post:",
              postId: selectedPost.id,
              notificationType: "commented",
            }
          : {
              receiverId: selectedPost.postedBy.id,
              senderId: loggedInUser.id,
              text: commentText,
              subject: "added comment to your reel:",
              reelId: selectedPost.id,
              notificationType: "commented",
            };

      const newNotification = await newNotificationMutation({
        variables: variables,
      });

      const data = newNotification.data;
      socket.emit("NEW_NOTIFICATION_RECEIVED", data?.newNotification);
    } catch (err) {}
  };

  const manageReplyNotification = async () => {
    try {
      if (selectedComment?.user.id === loggedInUser.id) return;

      const cleanText = commentText.replace(/@\S+/g, "");
      let variables =
        selectedPost.dataType === "post"
          ? {
              receiverId: selectedComment?.user.id,
              senderId: loggedInUser.id,
              text: cleanText,
              subject: "replied to your comment:",
              postId: selectedPost.id,
              notificationType: "replied",
            }
          : {
              receiverId: selectedComment?.user.id,
              senderId: loggedInUser.id,
              text: cleanText,
              subject: "replied to your comment:",
              reelId: selectedPost.id,
              notificationType: "replied",
            };

      const newNotification = await newNotificationMutation({
        variables: variables,
      });

      const data = newNotification.data;
      socket.emit("NEW_NOTIFICATION_RECEIVED", data?.newNotification);
    } catch (err) {}
  };

  const addCommentFunction = async (e: any) => {
    try {
      if (!commentLoading) {
        setCommentLoading(true)
        const newComment = {
          id: getUniqueId(),
          user: {
            name: loggedInUser?.name,
            username: loggedInUser?.username,
            profilePic: loggedInUser?.profilePic,
            id: loggedInUser?.id,
          },
          text: commentText,
          createdAt: new Date().toISOString(),
          likes: [],
          totalReplys: 0,
          replys: [],
          loading: true,
        };
        setCommentText("");

        dispatch(addTempComment(newComment));

        const response = await addCommentMutation({
          variables: {
            dataType: selectedPost?.dataType,
            id: selectedPost?.id,
            userId: loggedInUser?.id,
            text: commentText,
          },
          update(cache, { data }) {
            const comments = cache.readQuery({
              query: GET_COMMENTS,
              variables: {
                postId: selectedPost?.id,
                offset: offset,
              },
            });

            if (!comments) return;

            cache.writeQuery({
              query: GET_COMMENTS,
              variables: {
                postId: selectedPost?.id,
                offset: offset,
              },
              data: {
                //@ts-ignore
                getComments: [...comments?.getComments, data?.addComment].sort(
                  (a: any, b: any) => b.createdAt - a.createdAt
                ),
              },
            });
          },
        });

        const data = await response.data;
        dispatch(addComment({ tempID: newComment.id, data: data.addComment }));
        setCommentLoading(false)
        manageCommentNotification();
      }
    } catch (err) {}
  };

  const calculateOffOfComments = (commentId: string) => {
    const index = selectedPostComments.findIndex(
      (comment: CommentType) => comment.id === commentId
    );

    if (index <= 10) {
      return 0;
    } else {
      const remainder = index % 10;
      const result = index - remainder;
      return result;
    }
  };

  const replyOnCommentFunction = async (e: any) => {
    try {
      if (!commentLoading) {
        setCommentLoading(true)
        const reply = {
          id: getUniqueId(),
          user: {
            name: loggedInUser?.name,
            username: loggedInUser?.username,
            profilePic: loggedInUser?.profilePic,
            id: loggedInUser?.id,
          },
          text: commentText,
          createdAt: new Date().toISOString(),
          likes: [],
          replys: [],
          loading: true,
          isReply: true,
        };

        setCommentText("");
        dispatch(
          addTemperoryReply({ commentId: selectedCommentId, data: reply })
        );

        let response = await replyOnCommentMutation({
          variables: {
            userId: loggedInUser.id,
            commentId: selectedCommentId,
            text: commentText,
            isReply: true,
          },
          update(cache, { data }) {
            //@ts-ignore
            const { getComments } = cache.readQuery({
              query: GET_COMMENTS,
              variables: {
                postId: selectedPost?.id,
                offset: calculateOffOfComments(selectedCommentId),
              },
            });

            const updateCommentsArray = getComments.map(
              (comment: CommentType) => {
                if (comment.id === selectedCommentId) {
                  return {
                    ...comment,
                    totalReplys: comment.totalReplys + 1,
                    isReply: true,
                    replys: [...comment.replys, data?.replyOnComment].sort(
                      (a: any, b: any) => b.createdAt - a.createdAt
                    ),
                  };
                } else {
                  return comment;
                }
              }
            );

            cache.writeQuery({
              query: GET_COMMENTS,
              variables: {
                postId: selectedPost?.id,
                offset: calculateOffOfComments(selectedCommentId),
              },
              data: {
                getComments: updateCommentsArray,
              },
            });
          },
        });
        let data = await response.data;
        dispatch(
          addNewReply({
            tempID: reply.id,
            commentId: selectedCommentId,
            data: data?.replyOnComment,
          })
        );
        manageReplyNotification();
        setCommentLoading(false)
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (commentText.length == 0 || commentText.length < 1) {
      setReplying(false);
      setSelectedCommentId("");
    }
  }, [commentText]);

  useEffect(() => {
 
    if (videoRef.current && !viewPost) {

      //@ts-ignore
      videoRef.current.seekTo(0);
    }
  }, [viewPost]);

  useEffect(() => {
    if (replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replying]);

  return (
    <div
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000 ${styles.container}`}
    >
      <AiOutlineClose
        onClick={() => dispatch(handleViewPost(false))}
        style={{
          position: "absolute",
          top: "1%",
          right: "1%",
          fontSize: "30px",
          color: "white",
          cursor: "pointer",
          zIndex: "3",
        }}
        className={styles.Close}
      />
      <div className={`main-bg-color absolute ${styles.box}`}>
        <div
          className={`w-100 h-100 flex ai-start jc-center ${styles.content}`}
        >
          <input type="file" style={{ display: "none" }} id="upload" />
          <div
            className={`relative ${styles.Post} ${
              selectedPost?.dataType === "reel"
                ? `${styles.reel}`
                : selectedPost?.objectFit === "reel"
                ? `${styles.reel_type}`
                : `${styles.square}`
            }`}
            style={{ position: "relative" }}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused && selectedPost?.uploadedData[0].includes(".mp4") ? (
              <FaPlay className="play" />
            ) : null}

            {postLoadingState ? (
              <div
                className={`relative ${styles.Post} ${
                  selectedPost?.dataType === "reel"
                    ? `${styles.reel}`
                    : selectedPost?.objectFit === "reel"
                    ? `${styles.reel_type}`
                    : `${styles.square}`
                } ${styles.loading_post}`}
              ></div>
            ) : (
              <>
                <AiOutlineClose
                  onClick={() => dispatch(handleViewPost(false))}
                  style={{
                    position: "absolute",
                    top: "3%",
                    right: "3%",
                    fontSize: "30px",
                    color: "white",
                    cursor: "pointer",
                  }}
                  className={styles.Close_2}
                />
                {selectedPost?.uploadedData[0]?.includes(".mp4") ? (
                  <ReactPlayer
                    url={selectedPost?.uploadedData[0]}
                    width="100%"
                    height="100%"
                    loop={true}
                    playing={isPaused || !viewPost || editPost ? false : true}
                    muted={isMuted || !viewPost || editPost ? true : false}
                    controls={false}
                    played={0}
                    ref={videoRef}
                  />
                ) : (
                  <Image
                    fill={true}
                    priority={true}
                    loading="eager"
                    src={selectedPost?.uploadedData[0]}
                    alt="post_data"
                  className={`${styles.img_ab} ${selectedPost?.objectFit === "rectangle" ? styles.h_auto : null}`}
                  style={{aspectRatio:selectedPost?.objectFit === "reel" ? "9/16" : selectedPost?.objectFit === "square" ? "1/1" : "16/9"}}
                  />
                )}

                {selectedPost?.uploadedData[0]?.includes(".mp4") ? (
                  <button
                    className={`btn br-50 flex ai-center jc-center absolute zi-10 ${styles.volumn_btn}`}
                    style={{ padding: "9px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(handleMute(!isMuted));
                    }}
                  >
                    {isMuted ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                  </button>
                ) : null}
              </>
            )}
          </div>

          <div
            className={`h-100 flex ai-start jc-start flex-grow f-d-c ${styles.Post_Details}`}
          >
            {postLoadingState && selectedPostComments.length < 15 ? null : (
              <>
                <div className="flex ai-center jc-sb w-100 b-bottom-light p-15">
                  <div
                    className={`w-100 flex ai-center jc-start  ${styles.UserInfo}`}
                  >
                    <Image
                      src={selectedPost?.postedBy.profilePic}
                      width={35}
                      height={35}
                      className="ofit-cover br-50"
                      style={{ marginRight: "12px", borderRadius: "50%" }}
                      alt=""
                    />
                    <div className="flex ai-start jc-start f-d-c">
                      <p className="fs-m-normal primary-text-color">
                        {selectedPost?.postedBy.username}
                      </p>
                      <p
                        style={{ fontSize: "0.8rem", marginTop: "2px" }}
                        className="secondary-text-color fw-600"
                      >
                        Uploaded {convertPostCreatedAt(selectedPost?.createdAt)}
                      </p>
                    </div>
                    {/* {selectedPost?.postedBy.id === loggedInUser.id ? null : (
                    <span>•</span>
                  )} */}
                    {/* <button className="btn bg-none fw-600 highlight-text-color fs-m-normal br-10 c-pointer m-l-10">
                    {selectedPost?.postedBy.id === loggedInUser.id
                      ? null
                      : loggedInUser?.following?.includes(
                          selectedPost?.postedBy.id
                        )
                      ? "Following"
                      : "Follow"}
                  </button> */}
                  </div>

                  {loggedInUser.id === selectedPost?.postedBy?.id  && router.asPath.startsWith("/profile")? (
                    <div className="flex ai-center jc-center ">
                      <button
                        className={`btn br-50 flex ai-center jc-center zi-10 ${styles.b_btn}`}
                        // style={{padding:"12px"}}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(handleSelectedPost(selectedPost));
                          dispatch(handleEditPost(true));
                        }}
                      >
                        <MdModeEditOutline />
                      </button>
                      <button
                        className={`btn br-50 flex ai-center jc-center zi-10 ${styles.b_btn}`}
                        // style={{padding:"12px"}}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(handleSelectedPost(selectedPost));
                          dispatch(handleDeleteConfirmation(true));
                        }}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  ) : null}
                </div>

                {router.asPath.startsWith("/profile/") ? (
                  <div
                    className={`b-bottom-light flex ai-start jc-start flex-grow f-d-c ${styles.Post_Details} ${styles.mob_view}`}
                    style={{ width: "100%", padding: "20px" }}
                  >
                    <div className="flex ai-start jc-sb w-100">
                      <div>
                        {
                          // @ts-ignore
                          selectedPost?.likes?.includes(loggedInUser.id) ? (
                            <AiFillHeart
                              onClick={removedLikeFunction}
                              style={{ color: "red", fontSize: "30px" }}
                            />
                          ) : (
                            <AiOutlineHeart
                              onClick={addLikeFunction}
                              style={{ color: "white", fontSize: "30px" }}
                            />
                          )
                        }
                        {selectedPost?.commentsOff ? null : (
                          <MdOutlineModeComment
                            style={{
                              fontSize: "28px",
                              color: "white",
                              marginLeft: "15px",
                            }}
                          />
                        )}
                        <TbSend
                          style={{
                            fontSize: "29px",
                            color: "white",
                            marginLeft: "15px",
                            rotate: "20deg",
                            position: "relative",
                            bottom: "2px",
                          }}
                          onClick={() => {
                            dispatch(handleSharePost(true));
                            dispatch(handleSelectedPost(selectedPost));
                          }}
                        />
                      </div>

                      {loggedInUser?.savedPosts.includes(selectedPost?.id) ||
                      loggedInUser?.savedReels.includes(selectedPost?.id) ? (
                        <FaBookmark
                          style={{
                            color: "white",
                            fontSize: "25px",
                            marginTop: "5px",
                          }}
                          onClick={() =>
                            unSavePostAndReels(
                              unSavePostAndReelsMutation,
                              selectedPost,
                              loggedInUser,
                              token,
                              dispatch,
                              unSavePost
                            )
                          }
                        />
                      ) : (
                        <FaRegBookmark
                          style={{
                            color: "white",
                            fontSize: "25px",
                            marginTop: "5px",
                          }}
                          onClick={() =>
                            savePostAndReels(
                              savePostAndReelsMutation,
                              selectedPost,
                              loggedInUser,
                              token,
                              dispatch,
                              savePost
                            )
                          }
                        />
                      )}
                    </div>

                    {selectedPost?.viewsAndLikesHide ? null : (
                      <h4>{selectedPost?.likes?.length} likes</h4>
                    )}
                  </div>
                ) : null}

                <div
                  className={`w-100 h-100 flex flex-grow f-d-c of-x-hidden of-y-scroll ${styles.AllComments}`}
                >
                  {commmentsLoading && selectedPostComments.length < 1 ? (
                    <p
                      style={{
                        width: "100%",
                        textAlign: "center",
                        color: "white",
                        fontSize: "1.1rem",
                        padding: "20px",
                      }}
                    >
                      Loading Comments...
                    </p>
                  ) : (
                    <div
                      className="flex ai-start jc-start f-d-c"
                      style={{ minHeight: "100%" }}
                    >
                      {selectedPost?.description?.length <= 0 ? null : (
                        <div className="flex ai-start jc-start f-d-c">
                          <div
                            className={`w-100 flex ai-center jc-start b-bottom-light p-15 ${styles.UserInfo}`}
                            style={{
                              borderBottom: "none",
                              alignItems: "flex-start",
                            }}
                          >
                            <Image
                              src={selectedPost?.postedBy.profilePic}
                              width={35}
                              height={35}
                              loading="eager"
                              alt="profile pic"
                              className="ofit-cover br-50"
                            />
                            <div className="w-100 flex ai-start jc-start f-d-c m-l-20">
                              <p className="fs-m-normal primary-text-color">
                                {selectedPost?.postedBy.username}
                              </p>
                              <pre className={styles.pre}>
                                {selectedPost?.description}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedPost?.commentsOff &&
                      selectedPostComments.length <= 0 ? (
                       null
                      ) : selectedPostComments.length <= 0 &&
                        !commmentsLoading ? (
                        <div className=" w-100 f-d-c flex ai-center jc-center h-100 template">
                          <LiaCommentSolid />
                          <p className="primary-text-color fs-large">
                            No Comments Yet
                          </p>
                          <span>{`Be the first one to comment on this ${selectedPost?.dataType}`}</span>
                        </div>
                      ) : (
                        selectedPostComments?.map((comment: CommentType) => {
                          return (
                            <Comment
                              key={comment.id}
                              setSelectedComment={setSelectedComment}
                              data={comment}
                              setComment={setCommentText}
                              setReplying={setReplying}
                              setSelectedCommentId={setSelectedCommentId}
                              commentOffset={offset}
                              socket={socket}
                              calculateOffOfComments={calculateOffOfComments}
                            />
                          );
                        })
                      )}

                      {selectedPost?.comments?.length >
                      selectedPostComments?.length ? (
                        <VisibleElementTracker
                          page="comment"
                          offset={offset}
                          setOffset={setOffset}
                        />
                      ) : null}
                    </div>
                  )}
                </div>

                <div
                  className={`flex ai-start jc-start f-d-c w-100 ${styles.More_Data}`}
                  style={{ borderTop: "1px solid #333" }}
                >
                  {router.asPath.startsWith("/profile/") ? (
                    <div
                      className={`h-100 flex ai-start jc-start flex-grow f-d-c ${styles.Post_Details} ${styles.pc_view} `}
                      style={{ width: "100%", padding: "20px" }}
                    >
                      <div className="flex ai-start jc-sb w-100">
                        <div>
                          {
                            // @ts-ignore
                            selectedPost?.likes?.includes(loggedInUser.id) ? (
                              <AiFillHeart
                                onClick={removedLikeFunction}
                                style={{ color: "red", fontSize: "30px" }}
                              />
                            ) : (
                              <AiOutlineHeart
                                onClick={addLikeFunction}
                                style={{ color: "white", fontSize: "30px" }}
                              />
                            )
                          }
                          {selectedPost?.commentsOff ? null : (
                            <MdOutlineModeComment
                              style={{
                                fontSize: "28px",
                                color: "white",
                                marginLeft: "15px",
                              }}
                            />
                          )}
                          <TbSend
                            style={{
                              fontSize: "29px",
                              color: "white",
                              marginLeft: "15px",
                              rotate: "20deg",
                              position: "relative",
                              bottom: "2px",
                            }}
                            onClick={() => {
                              dispatch(handleSharePost(true));
                              dispatch(handleSelectedPost(selectedPost));
                            }}
                          />
                        </div>

                        {loggedInUser?.savedPosts.includes(selectedPost?.id) ||
                        loggedInUser?.savedReels.includes(selectedPost?.id) ? (
                          <FaBookmark
                            style={{
                              color: "white",
                              fontSize: "25px",
                              marginTop: "5px",
                            }}
                            onClick={() =>
                              unSavePostAndReels(
                                unSavePostAndReelsMutation,
                                selectedPost,
                                loggedInUser,
                                token,
                                dispatch,
                                unSavePost
                              )
                            }
                          />
                        ) : (
                          <FaRegBookmark
                            style={{
                              color: "white",
                              fontSize: "25px",
                              marginTop: "5px",
                            }}
                            onClick={() =>
                              savePostAndReels(
                                savePostAndReelsMutation,
                                selectedPost,
                                loggedInUser,
                                token,
                                dispatch,
                                savePost
                              )
                            }
                          />
                        )}
                      </div>
                      {selectedPost?.viewsAndLikesHide ? null : (
                        <h4>{selectedPost?.likes?.length} likes</h4>
                      )}
                    </div>
                  ) : null}

                  <div
                    className={`flex ai-center jc-center ${styles.addComment}`}
                    style={{
                      padding:`${selectedPost?.commentsOff ? "15px 20px" : "10px 20px"}`,
                      position: "relative",
                      width: "100%",
                      borderTop: "1px solid #333",
                    }}
                  >
                    {selectedPost?.commentsOff ? (
                      <input
                        type="text"
                        disabled={true}
                        value={"Comments are turned off"}
                        readOnly={true}
                        className="w-100 bg-none fs-m-small"
                        style={{
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#888",
                          border:"none"
                        }}
                      />
                    ) : replying ? (
                      <input
                      disabled={commentLoading}
                        className="btn bg-none primary-text-color fs-m-normal w-100"
                        style={{ padding: "12px 30px 12px 12px" }}
                        type="text"
                        autoComplete="new-text"
                        placeholder={`${commentLoading ? "Adding your reply..." : "Add a comment..."}`}
                        // onKeyUp={replyOnCommentFunction}
                        onChange={(e) => setCommentText(e.target.value)}
                        value={commentText}
                        ref={replyInputRef}
                      />
                    ) : (
                      <input
                      disabled={commentLoading}
                        className="btn bg-none primary-text-color fs-m-normal w-100"
                        style={{ padding: "12px 30px 12px 12px" }}
                        type="text"
                        placeholder={`${commentLoading ? "Adding your comment..." : "Add a comment..."}`}
                        autoComplete="new-text"
                        // onKeyUp={addCommentFunction}
                        onChange={(e) => setCommentText(e.target.value)}
                        value={commentText}
                      />
                    )}
                   <button className="bg-none b-none fw-600 fs-m-small c-pointer" style={{color:`${commentLoading ? "#0072c4" : "#0094ff"}`}} onClick={replying ? replyOnCommentFunction  : addCommentFunction}> {selectedPost?.commentsOff ? null : "Post"}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
