import { EDIT_POST } from "@/graphQl/mutations";
import { POST } from "@/graphQl/queries";
import { handleEditPost, handleLoadingTask } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/EditPost.module.css";
import { PostType } from "@/types/types";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

interface EditPostProps {}

const EditPost: FC<EditPostProps> = ({}) => {
  const dispatch = useDispatch();
  const openEditPost = useSelector(
    (state: RootState) => state.more.openEditPost
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [viewsAndLikesHide, setViewsAndLikesHide] = useState<boolean>(false);
  const [commentsOff, setCommentsOff] = useState<boolean>(false);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [description, setDescription] = useState<string>("");
  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  const [postInfo, setPostInfo] = useState<PostType>()
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [editPostMutation] = useMutation(EDIT_POST);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [paused,setPaused] = useState<boolean>(false)
  const [mute,setMute] = useState<boolean>(true)

  const {
    loading: pLoading,
    data: postData,
    error: postError,
  } = useQuery(POST, {
    variables: { dataType: selectedPost?.dataType, postId: selectedPost?.id },
    skip: !openEditPost,
  });

  useEffect(() => {
    setPostLoading(true);
    if (postData?.post) {
      setPostInfo(postData?.post);
      setDescription(postData?.post.description);
      setCommentsOff(postData?.post.commentsOff);
      setViewsAndLikesHide(postData?.post.viewsAndLikesHide);
      setPostLoading(false);
    }
  }, [postData]);

  const editPost = async () => {
    try {
      dispatch(handleLoadingTask(true));
      const response = await editPostMutation({
        variables: {
          dataType:postInfo?.dataType,
          postId: postInfo?.id,
          viewsAndLikesHide: viewsAndLikesHide,
          commentsOff: commentsOff,
          description: description,
        },
      });

      dispatch(handleLoadingTask(false));
      dispatch(handleEditPost(false));
      bottomNotification(dispatch, "Changes saved");
    } catch (err) {
      bottomNotification(
        dispatch,
        `Cannot update ${selectedPost?.dataType} at this moment, try again later`
      );
    }
  };

  return (
    <form
      className={`w-100vw h-100dvh fixed left-0 top-0 ai-center jc-center show-overlay-container flex zi-10000`}
      onSubmit={(e) => e.preventDefault()}
    >
      <AiOutlineClose
        onClick={() => dispatch(handleEditPost(false))}
        style={{
          position: "absolute",
          top: "3%",
          right: "3%",
          fontSize: "30px",
          color: "white",
          cursor: "pointer",
        }}
        className={styles.bbb}
      />
      <div className={`h-100dvh br-15 absolute ${styles.box}`}>
        <div
          className={`w-100 flex center jc-sb primary-text-color b-bottom-light ai-center ${styles.header}`}
          style={{ height: "60px", padding: "15px 23px" }}
        >
          <h4>Edit post</h4>
          {loading ? (
            <button className="btn c-pointer highlight-text-color fs-m-normal fw-600 bg-none">
              Saving changes...
            </button>
          ) : (
            <button
              className="btn c-pointer highlight-text-color fs-m-normal fw-600 bg-none"
              onClick={editPost}
            >
              Submit
            </button>
          )}
          <AiOutlineClose
            onClick={() => dispatch(handleEditPost(false))}
            style={{
              fontSize: "30px",
              color: "white",
              cursor: "pointer",
            }}
            className={styles.bb}
          />
        </div>

        <div className={`w-100 flex ai-start jc-start ${styles.content}`}>
          <div
            className={`h-100 main-bg-color relative ai-center jc-center flex ${styles.post} ${
              selectedPost?.dataType === "reel"
                ? `${styles.reel}`
                : selectedPost?.objectFit === "reel"
                ? `${styles.reel_type}`
                : `${styles.square}`
            }`}
            onClick={() => setPaused(!paused)}
          >

{postInfo?.uploadedData[0].includes(".mp4") ? (
          <button
          style={{cursor:"pointer"}}
            className="btn br-50 flex ai-center jc-center absolute volumn_btn zi-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMute(!mute)
            }}
          >
         {mute ? <HiSpeakerXMark /> : <HiSpeakerWave />}
          </button> ) : null
}


{paused && postInfo?.uploadedData[0].includes(".mp4") ? (
              <FaPlay className="play" />
            ) : null}

            {postLoading ? (
              <div className={styles.loading_post}></div>
            ) : postInfo?.uploadedData[0].includes(".mp4") ? (
              <ReactPlayer
              playing={paused ? false : true}
               height="100%"
                url={postInfo.uploadedData[0]}
                autoPlay={paused}
                muted={mute}
                style={
                  postInfo.objectFit == "square"
                    ? { objectFit: "cover" }
                    : postInfo.objectFit == "rectangle" ? {height:"55%"} :  { width: "70%"}
  
                }
              />
            ) : postInfo && (
              //@ts-ignore
              <Image
              fill={true}
              priority={true}
              loading="eager"
              src={postInfo.uploadedData[0]}
              alt="post_data"
            className={`${styles.img_ab} ${postInfo?.objectFit == "rectangle" ? styles.h_auto : null}`}
            style={{aspectRatio:postInfo?.objectFit == "reel" ? "9/16" : postInfo?.objectFit == "square" ? "1/1" : "16/9"}}
            />

            )}
          </div>

          {postLoading ? null : (
            <div
              className={`h-100 flex ai-start jc-start flex-grow-1 f-d-c ${styles.post_details}`}
            >
              <div className="w-100 flex ai-center jc-start">
                <Image
                  src={`${loggedInUser.profilePic}`}
                  alt=""
                  width={35}
                  height={35}
                  className="ofit-cover br-50"
                  style={{ marginRight: "13px" }}
                />
                <p className="primary-text-color">{loggedInUser.username}</p>
              </div>

              <textarea
                name=""
                id=""
                placeholder="Write a caption..."
                className="btn w-100 m-t-20 of-y-hidden fs-m-small l-h-20 br-10 primary-text-color main-mid-bg-color p-10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>

              <div className="w-100">
                <p className={styles.he}>Advanced Options</p>

                <div
                  className={`flex ai-start jc-sb w-100 m-t-20 ${styles.options}`}
                >
                  <div>
                    <p>Hide like and views count on this post</p>
                    <span className="flex">
                      {
                        "Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people's posts, go to your account settings."
                      }
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    checked={viewsAndLikesHide}
                    onChange={() => setViewsAndLikesHide(!viewsAndLikesHide)}
                  />
                </div>

                <div
                  className={`flex ai-start jc-sb w-100 m-t-20 ${styles.options}`}
                  style={{ marginTop: "30px" }}
                >
                  <div>
                    <p>Turn off Comments</p>
                    <span className="flex">
                      You can change this later by going to the ··· menu at the
                      top of your post.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    checked={commentsOff}
                    onChange={(e) => setCommentsOff(!commentsOff)}
                  />
                </div>
              </div>

              <button
                className={`btn highlight-bg-color c-pointer fw-600 fs-m-normal w-100 ai-center jc-center m-t-10 primary-text-color br-10  ${styles.share}`}
                style={{ color: loading ? "#005fa3" : "" }}
                onClick={() => (loading || !isChanged ? null : editPost())}
              >
                {loading
                  ? "Saving changes..."
                  : isChanged
                  ? "Submit"
                  : "Waiting for changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default EditPost;
