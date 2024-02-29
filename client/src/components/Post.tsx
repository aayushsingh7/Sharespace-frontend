import { FC, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaBookmark, FaPlay, FaRegBookmark } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { MdOutlineModeComment } from "react-icons/md";
import { TbSend } from "react-icons/tb";

import {
  ADD_LIKE,
  INCREASE_VIEWS,
  NEW_NOTIFICATION,
  REMOVE_LIKE,
  SAVE_POST,
  UNSAVE_POST,
} from "@/graphQl/mutations";
import { POSTS } from "@/graphQl/queries";
import { handleMute, handleViewProfile } from "@/slice/moreSlice";
import { handleOpenSideNav, handleUserSearch } from "@/slice/navbarSlice";
import {
  addLikeFromFeedPost,
  handleSelectedPost,
  handleSharePost,
  handleViewPost,
  removeLikeFromFeedPost
} from "@/slice/postSlice";
import { setSelectedUserDetails } from "@/slice/selectedUserSlice";
import { savePost, unSavePost } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import { PostType } from "@/types/types";
import savePostAndReels from "@/utils/savePostAndReels";
import unSavePostAndReels from "@/utils/unSavePostAndReels";
import { useMutation } from "@apollo/client";
import "intersection-observer";
import Link from "next/link";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { GoHeartFill } from "react-icons/go";

import convertPostCreatedAt from "@/utils/convertPostCreatedAt";
import manageLikeNotification from "@/utils/manageLikeNotification";
import Image from "next/image";

interface PostProps {
  data: PostType;
  socket?:any;
}

const Post: FC<PostProps> = ({ data, socket }) => {

  const dispatch = useDispatch();
  const componentRef = useRef(null);
  const isMuted = useSelector((state: RootState) => state.more.isMuted);
  const [increaseViewsMutation] = useMutation(INCREASE_VIEWS);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [addLikeMutation] = useMutation(ADD_LIKE);
  const [removeLikeMutation] = useMutation(REMOVE_LIKE);
  const [savePostMutation] = useMutation(SAVE_POST);
  const [unSavePostMutation] = useMutation(UNSAVE_POST);
  const token = useSelector((state: RootState) => state.more.token);
  const [newNotificationMutation] = useMutation(NEW_NOTIFICATION)
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const isManuallyPausedRef = useRef<boolean>(false);
  const isViewAdded = useRef<boolean>(false)
  const videoRef = useRef(null);
  const [show, setShow] = useState<boolean>(false);
  const descriptionRef = useRef<any>(null);
  const viewPost = useSelector((state:RootState)=> state.post.viewPost)
  const inViewRef = useRef<boolean>(false)
  const [likeAnimation,setLikeAnimation] = useState<boolean>(false)
  let likeTimeout:any;


  const addLikeFunction = async (post: PostType) => {
    try {
      dispatch(
        addLikeFromFeedPost({ postId: post?.id, userId: loggedInUser.id })
      );


       setLikeAnimation(true)
       likeTimeout = setTimeout(()=> {
        setLikeAnimation(false)
      },2000)
      
      clearTimeout(likeTimeout)

      const response = await addLikeMutation({
        variables: {
          dataType: post?.dataType,
          id: post?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          // @ts-ignore
          const posts = cache.readQuery({
            query: POSTS,
            variables: {
              userId: loggedInUser?.id,
              skip:0
            },
          });

          if(!posts) return;

          // @ts-ignore
          const updatedPosts = posts.posts.map((p) =>
            p.id === post?.id
              ? { ...p, likes: [...p.likes, loggedInUser?.id] }
              : p
          );

          cache.writeQuery({
            query: POSTS,
            data: {
              posts: updatedPosts,
            },
          });
        },
      });
      // const data = await response.data;
      manageLikeNotification(socket,loggedInUser,data,newNotificationMutation,"post_and_reels_like")
    } catch (err) {}
  };


  const removeLikeFunction = async (post: PostType) => {
    try {
      dispatch(
        removeLikeFromFeedPost({ postId: post?.id, userId: loggedInUser.id })
      );
      setLikeAnimation(false)
      //@ts-ignore
      clearTimeout(likeTimeout)
      const response = await removeLikeMutation({
        variables: {
          dataType: post?.dataType,
          id: post?.id,
          userId: loggedInUser.id,
        },
        update(cache, { data }) {
          // @ts-ignore
          const { posts } = cache.readQuery({
            query: POSTS,
            variables: {
              userId: loggedInUser?.id,
              skip:0,
            },
          });

          // @ts-ignore
          const updatedPosts = posts.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                likes: p.likes.filter(
                  (userId: any) => userId !== loggedInUser.id
                ),
              };
            } else {
              return p;
            }
          });

          cache.writeQuery({
            query: POSTS,
            data: {
              posts: updatedPosts,
            },
          });
        },
      });

      const data = await response.data;
    } catch (err) { }
  };

  
const increaseViews  = async()=> {
  try {
    if(isViewAdded.current) return
    const response = await increaseViewsMutation({
      variables: {
        userId: loggedInUser.id,
        postId: data?.id,
        dataType: data?.dataType
      }
    })
    isViewAdded.current = true;
  } catch (err) {
    console.log(err)
  }
}

  const handleClicks = (username: any, userId: any) => {
    dispatch(handleViewProfile(true));
    dispatch(
      setSelectedUserDetails({
        username: username,
        userId: userId,
      })
    );
    dispatch(handleOpenSideNav(true));
    dispatch(handleUserSearch(false));
  };


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inViewRef.current = true;
         
          //@ts-ignore
          if (videoRef.current) {
            if (!isManuallyPausedRef.current) {
              //@ts-ignore
              videoRef.current.seekTo(0);
            }
          }
          if (!isManuallyPausedRef.current) {
            setIsPaused(false);
          } else {
            setIsPaused(true);
          }

          // increaseViews()

        } else {
          inViewRef.current = false;
          setIsPaused(true);
        }
      });
    });

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

 



useEffect(() => {
 if(viewPost){
  setIsPaused(true)
 }else if(isPaused && inViewRef.current){
 setIsPaused(false)
 }
}, [viewPost]);

  return (
    <div className="w-100 m-t-10 b-bottom post-container">
      <div className="main-bg-color w-100 flex ai-center jc-sb" style={{height:"60px"}}>
        <div className="flex ai-center jc-center p-10">
          <Image src={data?.postedBy.profilePic} priority={true} alt="user-pic" width={35} height={35} className="br-50 ofit-cover" style={{marginRight:"15px"}} loading="eager" />
          <Link
            style={{ textDecoration: "none" }}
            href={`/profile/${data?.postedBy.username}`}
            onClick={() =>
              handleClicks(data?.postedBy.username, data?.postedBy.id)
            }
          >
            <div className="flex ai-start jc-start f-d-c">
              <h4 className="primary-text-color">{data?.postedBy.username}</h4>
            </div>
          </Link>
        </div>

        <FiMoreHorizontal
          style={{ fontSize: "25px", color: "white", marginRight: "10px " }}
        />
      </div>

      <div
        className={`post  h-auto w-100 b relative flex ai-center jc-center  main-bg-color`}
        onClick={() => {
          setIsPaused(!isPaused);
          isManuallyPausedRef.current = !isManuallyPausedRef.current; 
        }}
        
        style={{maxHeight:data?.objectFit === "reel" && data?.uploadedData[0].includes(".mp4")  ? "600px" : "auto",aspectRatio:
          data?.objectFit === "reel" ? "9/16" : data?.objectFit === "square" ? "1/1" : "16/9"
        }}
  
    >  

      {
        likeAnimation? <div className=" zi-100 w-100 h-100 flex ai-center jc-center heart-animation-container">
        <GoHeartFill className="heart-animation" />
      </div> : null
      }

        <div
          ref={componentRef}
          style={{
            width: "100%",
            height: "20%",
            position: "absolute",
            top: "30%",
            left: "0%",
          }}
        ></div>

        {data?.uploadedData[0]?.includes(".mp4") ? (
          <button
            className="btn br-50 flex ai-center jc-center absolute volumn_btn zi-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(handleMute(!isMuted))
            }}
          >
            {isMuted ? <HiSpeakerXMark /> : <HiSpeakerWave />}
          </button>
        ) : null}
        {data?.uploadedData[0]?.includes("mp4") ? (
          <ReactPlayer
            url={data?.uploadedData[0]}
            width={data?.objectFit === "reel" ? "380px" : "100%"}
            height="100%"
            loop={true}
            playing={isPaused ? false : true}
            muted={isMuted ? true : false}
            controls={false}
            ref={videoRef}
          
          />
        ) : (
          <Image src={data?.uploadedData[0]} alt="post" loading="eager" fill={true} className="ofit-cover" priority={true}/>
        )}

        {isPaused && data?.uploadedData[0]?.includes(".mp4") ? (
          <FaPlay className="play" />
        ) : null}

      </div>

      <div className="post-details w-100 main-bg-color" style={{padding:"10px 10px"}}>
        <div className="flex ai-start jc-sb w-100">
          
          <div>
            {
              // @ts-ignore
              data?.likes.includes(loggedInUser?.id) ? (
                <AiFillHeart
                  onClick={() => removeLikeFunction(data)}
                  style={{ color: "red", fontSize: "30px" }}
                />
             
              ) : (
                <AiOutlineHeart
                  onClick={() => addLikeFunction(data)}
                  style={{ color: "white", fontSize: "30px" }}
                />
              )
            }
          {
            data?.commentsOff ? null :  <MdOutlineModeComment
            style={{ fontSize: "28px", color: "white", marginLeft: "15px" }}
            onClick={() => {
              dispatch(handleViewPost(true));
              dispatch(handleSelectedPost(data));
            }}
          />
          }
            <TbSend
              style={{
                fontSize: "29px",
                color: "white",
                marginLeft: "15px",
                rotate: "22deg",
                position: "relative",
                bottom: "3px",
              }}
              onClick={() => {
                dispatch(handleSharePost(true));
                dispatch(handleSelectedPost(data));
              }}
            />
          </div>

          {loggedInUser.savedPosts.includes(`${data?.id}`) || loggedInUser.savedReels.includes(`${data?.id}`) ? (
            <FaBookmark
              style={{ color: "white", fontSize: "25px", marginTop: "5px" }}
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
              style={{ color: "white", fontSize: "25px", marginTop: "5px" }}
              onClick={() =>
                savePostAndReels(
                  savePostMutation,
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
       {
        data?.viewsAndLikesHide ? null :  <h4 className="primary-text-color" style={{ margin: "7px 0px",fontSize:"1rem"}}>{data?.likes.length} likes</h4>
       }

        <div style={{marginTop:data?.viewsAndLikesHide ? "10px" : "0px"}}>
          <p className="flex primary-text-color l-h-15">
            <span  className="primary-text-color" style={{ fontWeight: "600" }}>{data?.postedBy.username}</span>
            
            <span
            style={{marginLeft:"5px"}}
              onClick={() => setShow(!show)}
              className={`${show ? "" : "wk-box"} primary-text-color`}
              ref={descriptionRef}
            >
              {data?.description}
            </span>


          </p>
        </div>

        <button
          className="btn secondary-text-color fs-m-normal c-pointer main-bg-color" style={{margin:"9px 0px"}}
          onClick={() => {
            dispatch(handleViewPost(true));
            dispatch(handleSelectedPost(data));
          }}
        >
          View all {data?.comments.length} comments
        </button>

        <p className="fs-small secondary-text-color" style={{margin:"6px 0px"}}>{convertPostCreatedAt(data?.createdAt)}</p>
      </div>
    </div>
  );
};

export default Post;
