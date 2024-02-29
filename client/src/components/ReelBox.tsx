import {
  ADD_LIKE,
  NEW_NOTIFICATION,
  REMOVE_LIKE,
  SAVE_POST,
  UNSAVE_POST,
} from "@/graphQl/mutations";
import { REELS } from "@/graphQl/queries";
import { handleMute } from "@/slice/moreSlice";
import {
  dislikeReel,
  handleSelectedPost,
  handleSharePost,
  handleViewPost,
  likeReel,
} from "@/slice/postSlice";
import { savePost, unSavePost } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import { ReelType } from "@/types/types";
import manageLikeNotification from "@/utils/manageLikeNotification";
import savePostAndReels from "@/utils/savePostAndReels";
import unSavePostAndReels from "@/utils/unSavePostAndReels";
import { useMutation } from "@apollo/client";
import "intersection-observer";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaBookmark, FaPlay, FaRegBookmark } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { MdOutlineModeComment } from "react-icons/md";
import { TbSend } from "react-icons/tb";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

interface ReelBoxProps {
  data: ReelType;
  socket: any;
}

const ReelBox: FC<ReelBoxProps> = ({ data, socket }) => {
  const [view, setView] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [newNotificationMutation] = useMutation(NEW_NOTIFICATION);
  const isManuallyPausedRef = useRef<boolean>(false);
  const componentRef = useRef<any | null>(null);
  const videoRef = useRef<any | null>(null);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [addLikeMutation] = useMutation(ADD_LIKE);
  const [removeLikeMutation] = useMutation(REMOVE_LIKE);
  const isMuted = useSelector((state: RootState) => state.more.isMuted);
  const [unSavePostMutation] = useMutation(UNSAVE_POST);
  const [savePostAndReelsMutation] = useMutation(SAVE_POST);
  const token = useSelector((state: RootState) => state.more.token);
  const [show, setShow] = useState<boolean>(false);
  const descriptionRef = useRef<any>(null);
  const viewPost= useSelector((state:RootState)=> state.post.viewPost)


  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(componentRef.current);
  }, []);

  useEffect(() => {
    if (view && !isManuallyPausedRef.current) {
      videoRef.current.seekTo(0, "seconds");
    }
  }, [view]);

  const handleIntersection = (entries: any) => {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting) {
        setView(true);
        if (!isManuallyPausedRef.current) {
          setIsPaused(false);
        } else {
          setIsPaused(true);
        }
      } else {
        setView(false);
        setIsPaused(true);
      }
    });
  };

  const addLikeFunction = async (reel: ReelType) => {
    try {
      dispatch(likeReel({ reelId: reel?.id, userId: loggedInUser.id }));
      const response = await addLikeMutation({
        variables: {
          dataType: reel?.dataType,
          id: reel?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          // @ts-ignore
          const { reels } = cache.readQuery({
            query: REELS,
            variables: {
              userId: loggedInUser?.id,
              skip: 0,
            },
          });

          // @ts-ignore
          const updatedReels = reels.map((p) => {
            if (p.id === reel.id) {
              return {
                ...p,
                likes: [...p.likes, loggedInUser.id],
              };
            } else {
              return p;
            }
          });

          cache.writeQuery({
            query: REELS,
            data: {
              reels: updatedReels,
            },
          });
        },
      });

      manageLikeNotification(
        socket,
        loggedInUser,
        data,
        newNotificationMutation,
        "post_and_reels_like"
      );
    } catch (err) {}
  };

  const removeLikeFunction = async (reel: ReelType) => {
    try {
      dispatch(dislikeReel({ reelId: reel?.id, userId: loggedInUser.id }));
      const response = await removeLikeMutation({
        variables: {
          dataType: reel?.dataType,
          id: reel?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          // @ts-ignore
          const { reels } = cache.readQuery({
            query: REELS,
            variables: {
              userId: loggedInUser?.id,
              skip: 0,
            },
          });

          // @ts-ignore
          const updatedReels = reels.map((p) =>
            p.id === reel?.id
              ? {
                  ...p,
                  likes: p.likes.filter(
                    (uId: string) => uId !== loggedInUser.id
                  ),
                }
              : p
          );

          cache.writeQuery({
            query: REELS,
            data: {
              reels: updatedReels,
            },
          });
        },
      });

      const data = await response.data;
    } catch (err) {}
  };

  useEffect(() => {
    if(viewPost){
     setIsPaused(true)
    }else if(isPaused && view){
    setIsPaused(false)
    }
   }, [viewPost]);

  return (
    <div
      className="reelbox-container w-100 flex ai-start jc-center relative"
      ref={componentRef}
    >
      <div
        className="reelbox-video-container h-100 br-10 of-hidden relative"
        onClick={() => {
          setIsPaused(!isPaused);
          isManuallyPausedRef.current = !isManuallyPausedRef.current;
        }}
        
      >
        {isPaused && data?.uploadedData[0].includes(".mp4") ? (
          <FaPlay className="play" />
        ) : null}
        <ReactPlayer
          url={`${data?.uploadedData[0]}`}
          width="100%"
          height="100%"
          loop={true}
          playing={view && !isPaused ? true : false}
          muted={view && !isMuted ? false : true}
          ref={videoRef}
        />
        {view ? (
          <button
            className="btn br-50 flex ai-center jc-center absolute volumn_btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(handleMute(!isMuted));
            }}
          >
            {isMuted ? <HiSpeakerXMark /> : <HiSpeakerWave />}
          </button>
        ) : null}

        <div
          className="absolute w-100 bottom-0 left-0 flex ai-start jc-start f-d-c zi-10"
          style={{ padding: "15px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-100 flex ai-center jc-start">
            {/* <div className={styles.profilePic}> */}
            <Image
              src={`${data?.postedBy?.profilePic}`}
              alt=""
              width={40}
              height={40}
              className="br-50 of-hidden"
              style={{ marginRight: "15px" }}
            />

            <p className="primary-text-color fw-600 fs-m-normal">
              {data?.postedBy.username}
            </p>
            <p
              className="primary-text-color"
              style={{ margin: "0px 10px", fontSize: "15px", marginTop: "2px" }}
            >
              •
            </p>
            <button
              className="btn fw-600 fs-small primary-text-color bg-none"
              style={{ marginTop: "2px" }}
            >
              {loggedInUser.following?.includes(data?.postedBy.id)
                ? "Following"
                : "Follow"}
            </button>
          </div>

          <div
            className="reelbox-description flex ai-end jc-start"
            style={{ padding: "13px 0px 5px 0px" }}
          >
            {" "}
            <span
              onClick={() => setShow(!show)}
              className={`${show ? "" : "wk-box"} primary-text-color`}
              ref={descriptionRef}
            >
              {data?.description}
            </span>
           
          </div>
        </div>
      </div>

      <div
        className="reelbox-options flex ai-center jc-end h-100 primary-text-color f-d-c"
        style={{ marginLeft: "30px", marginBottom: "1px" }}
      >
        <div
          className="flex ai-center jc-center f-d-c c-pointer"
          style={{ marginTop: "30px" }}
        >
          {data?.likes.includes(loggedInUser.id) ? (
            <AiFillHeart
              style={{ fontSize: "30px", color: "red" }}
              onClick={() => removeLikeFunction(data)}
            />
          ) : (
            <AiOutlineHeart
              style={{ color: "white", fontSize: "30px" }}
              onClick={() => addLikeFunction(data)}
            />
          )}
          {data.viewsAndLikesHide ? null : (
            <p style={{ marginTop: "5px" }}>{data.likes.length}</p>
          )}
        </div>
        <div
          className="flex ai-center jc-center f-d-c m-t-30 c-pointer"
          onClick={() => {
            dispatch(handleViewPost(true));
            dispatch(handleSelectedPost(data));
          }}
        >
          {data.commentsOff ? null : (
            <>
              {" "}
              <MdOutlineModeComment
                style={{ fontSize: "28px", color: "white" }}
              />
              <p style={{fontSize:"0.8rem",marginTop:"5px"}}>{data.comments.length}</p>
            </>
          )}
        </div>
        <div
          className="flex ai-center jc-end primary-text-color f-d-c"
          style={{ marginTop: "25px" }}
        >
          <TbSend
            style={{
              fontSize: "29px",
              color: "white",
              rotate: "22deg",
              position: "relative",
              bottom: "1px",
            }}
            onClick={() => {
              dispatch(handleSharePost(true));
              dispatch(handleSelectedPost(data));
            }}
          />
        </div>
        <div
          className="flex ai-center jc-end primary-text-color f-d-c"
          style={{ marginTop: "33px" }}
        >
          {loggedInUser.savedReels.includes(data?.id) ? (
            <FaBookmark
              style={{ color: "white", fontSize: "25px" }}
              onClick={() =>
                unSavePostAndReels(
                  unSavePostMutation,
                  data,
                  loggedInUser,
                  token,
                  dispatch,
                  unSavePost
                )
              }
            />
          ) : (
            <FaRegBookmark
              style={{ color: "white", fontSize: "25px" }}
              onClick={() =>
                savePostAndReels(
                  savePostAndReelsMutation,
                  data,
                  loggedInUser,
                  token,
                  dispatch,
                  savePost
                )
              }
            />
          )}
        </div>
        <div
          className="flex ai-center jc-end primary-text-color f-d-c"
          style={{ marginTop: "32px" }}
        >
          <Image
            src={data?.postedBy?.profilePic}
            alt=""
            width={30}
            height={30}
            style={{ borderRadius: "5px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReelBox;
