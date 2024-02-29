import { ADD_POST } from "@/graphQl/mutations";
import { handleLoadingTask } from "@/slice/moreSlice";
import { addNewPost, handleOpenCreatePost } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/CreatePost.module.css";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { FC, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsFiles } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { TbRectangle, TbRectangleVertical, TbSquare } from "react-icons/tb";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { getMetadata } from "video-metadata-thumbnails";

interface CreatePostProps {}

const CreatePost: FC<CreatePostProps> = ({}) => {
  const dispatch = useDispatch();
  const [file, setfile] = useState<any>(null);
  const [imgToggle, setImageToggle] = useState<number>(0);
  const [commentsOff, setCommentsOff] = useState<boolean>(false);
  const [viewsAndLikesHide, setViewsAndLikesHide] = useState<boolean>(false);
  const [uploadedDataType, setUploadedDataType] = useState<string>("post");
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [fileType, setFileType] = useState<string>("image");
  const user = useSelector((state: RootState) => state.user.user);
  const [addPostsAndReels] = useMutation(ADD_POST);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [mute,setMute] = useState<boolean>(true)
  const [paused,setPaused] = useState<boolean>(false)
  const [fileSizeExceed,setFileSizeExceed] = useState<boolean>(false)
  const videoRef = useRef(null)
  const [postDetails, setPostDetails] = useState({
    type: "",
    description: "",
  });

     
  function bytesToMegabytes(bytes:any):number {
    return parseInt((bytes / (1024 * 1024)).toFixed(2))
}

  const handleFileSubmit = (e: any) => {
    let file = e.target.files[0];
    
    if (e.target.files.length < 1) {
      alert("Please select only one file at a time.");
      file = null;
      return;
    }

    if (!file)
      return bottomNotification(dispatch, "Please add a valid file format");

      const size = bytesToMegabytes(file.size)
      if(size > 30){
        setFileSizeExceed(true)
        file = null;
        return;
      }else{
        setFileSizeExceed(false)
      }

    if (e.target.files[0]) {
      if (file.type.includes("image")) {
        setFileType("image");
        setUploadedDataType("post");
      } else if (file.type.includes("video")) {
        setFileType("video");
        getMetadata(file).then((metadata) => {
          const duration = metadata.duration;
          console.log("MetaData",metadata)
          if (duration < 60) {
            setUploadedDataType("reel");
            setImageToggle(2);
          } else {
            setUploadedDataType("post");
          }

          setVideoDuration(duration);
        });
      } else {
        bottomNotification(dispatch, "Invalid format");
        return new Error("Invalid Format");
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result;

      setfile(data);

      setUploadedData((prevData) => [...prevData, data]);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const createNewPost = async () => {
    try {
      if (uploadedData.length <= 0) {
        return bottomNotification(dispatch, "Image or video is required");
      }

      if (postDetails.description.length <= 0) {
        return bottomNotification(dispatch, "Descriptioin is necessary");
      }

      setLoading(true);
      dispatch(handleLoadingTask(true));
      const response = await addPostsAndReels({
        variables: {
          dataType: uploadedDataType,
          description: postDetails.description,
          objectFit:
            uploadedDataType === "reel"
              ? "reel"
              : imgToggle === 0
              ? "square"
              : imgToggle === 1
              ? "rectangle"
              : "reel",
          postedBy: user.id,
          uploadedData: uploadedData,
          viewsAndLikesHide: viewsAndLikesHide,
          commentsOff: commentsOff,
        },
      });

      const data = await response.data;
      dispatch(addNewPost(data?.addPostAndReels));
      window.scrollTo(0, 0);
      dispatch(handleOpenCreatePost(false));
      dispatch(handleLoadingTask(false));
      setLoading(false);
      bottomNotification(dispatch, "New post added");
    } catch (err) {
      bottomNotification(
        dispatch,
        "Cannot create new post now, try again later"
      );
    }
  };

  const closeCreatePost = () => {
    setUploadedData([]);
    dispatch(handleOpenCreatePost(false));
    setfile(null);
    setImageToggle(0);
    setViewsAndLikesHide(false);
    setCommentsOff(false);
    postDetails.description = "";
    postDetails.type = "";
  };

  return (
    <form
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
      onSubmit={(e) => e.preventDefault()}
    >
      <AiOutlineClose
        onClick={closeCreatePost}
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
      <div className={`h-80vh br-10 absolute ${styles.box}`}>
        <div
          className={`w-100 flex ai-center jc-sb primary-text-color ${styles.header}`}
          style={{ borderBottom: "1px solid #444" }}
        >
          <h4>Create new post</h4>

          <button
            disabled={loading}
            onClick={loading ? undefined : createNewPost}
            className="btn highlight-text-color c-pointer fw-600 bg-none fs-m-normal"
          >
            {loading ? "Sharing..." : "Share"}
          </button>

          <AiOutlineClose
            onClick={closeCreatePost}
            style={{
              fontSize: "30px",
              color: "white",
              cursor: "pointer",
            }}
            className={styles.bb}
          />
        </div>

        <div className={`w-100 flex ai-start jc-start ${styles.content}`} >

        
          <input
            type="file"
            style={{ display: "none" }}
            id="upload"
            multiple
            onChange={handleFileSubmit}
          />

          <div
            className={`h-100 main-mid-bg-color b-right-light relative flex ai-center jc-center ${styles.post}`}
            onClick={()=> setPaused(!paused)}
          >

{fileType == "video" ? (
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


        {paused && fileType === "video" ? (
          <FaPlay className="play" style={{fontSize:"60px"}}/>
        ) : null}

            {file ? (
              fileType === "video" ? (
                <ReactPlayer
                ref={videoRef}
                playing={paused ? false : true}
                 height="100%"
                  url={file}
                  autoPlay={paused}
                  muted={mute}
                  style={
                    imgToggle == 0
                      ? { objectFit: "cover" }
                      : imgToggle == 1 ? {height:"55%"} : imgToggle == 2 
                      ? { width: "70%"}
                      : { height: "100%" }
                  }
                />
               
                
              ) : (
                <img
                className={imgToggle ==1 ?  styles.autonomous_height : imgToggle == 2 ? styles.autonomous_width : undefined }
                  src={file}
                  alt="file"
                  style={
                    imgToggle == 0
                      ? { objectFit: "cover",aspectRatio:"1/1" }
                      : imgToggle == 1 ? {aspectRatio:"16/9"} : imgToggle == 2 
                      ? { aspectRatio:"9/16"}
                      : { height: "70%" }
                  }
                />
              )
            ) : (
              <>
                <div
                  className={`w-100 h-100 flex ai-center jc-center f-d-c relative ${styles.upload}`}
                  style={{padding:"20px 10px"}}
                >
                  <BsFiles
                    style={{
                      fontSize: "100px",
                      color: "white",
                      marginBottom: "20px",
                    }}
                  />
                  <p className="primary-text-color">
                    Drag photos and videos here
                  </p>
                  <label htmlFor="upload">
                    <p
                      className={`btn highlight-bg-color primary-text-color fs-m-small br-10 c-pointer br-10 m-t-20`}
                      style={{ padding: "10px 20px" }}
                    >
                      Select from gallery
                    </p>
                  </label>
                </div>
              </>
            )}
            {file ? (
              <div
                style={{ bottom: "2%" }}
                className={`w-100 absolute flex ai-center jc-sb p-10 ${styles.post__div}`}
              >
                {uploadedDataType === "reel" ? null : (
                  <div className="flex ai-center jc-center">

                    <div
                      className={`flex p-10 br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 0 ? styles.active_format : null}`}
                      onClick={() => setImageToggle(0)}
                    >
                      <TbSquare />
                    </div>


                      
                    <div
                      className={`flex p-10 br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 1 ? styles.active_format : null}`}
                      onClick={() => setImageToggle(1)}
                    >
                      <TbRectangle />
                    </div>


                    <div
                      className={`flex p-10 br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 2 ? styles.active_format : null}`}
                      onClick={() => setImageToggle(2)}
                    >
                      <TbRectangleVertical />
                    </div>

                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div
            className={`h-100 flex ai-start jc-start flex-grow-1 f-d-c ${styles.post_details}`}
          >
            <div className="w-100 flex ai-center jc-start">
              <Image
                src={`${loggedInUser.profilePic}`}
                alt=""
                width={35}
                height={35}
                className="ofit-cover br-50 m-r-10"
              />
              <p className="primary-text-color fs-m-small">
                {loggedInUser.username}
              </p>
            </div>

            {uploadedDataType === "reel" || fileSizeExceed ? (
              <div
                style={{
                  background: "#333",
                  padding: "8px",
                  borderRadius: "5px",
                  lineHeight: "22px",
                }}
                className="fs-small primary-text-color m-t-10"
              >
                <p style={{ color:fileSizeExceed ? "red" : "yellow",fontWeight:"600",fontSize:"0.9rem"}}>
                 {!fileSizeExceed ? "Videos of duration under 60 seconds will be considered as a reel" : "The file size exceeds the designated upload limit of 30 MB. Please reduce the file size before attempting to upload again."}
                </p>
              </div>
            ) : null}

            <textarea
              name=""
              id=""
              className="btn w-100 m-t-20 of-y-hidden fs-m-small l-h-20 br-10 primary-text-color main-mid-bg-color p-10"
              placeholder="Write a caption..."
              value={postDetails.description}
              onChange={(e) =>
                setPostDetails({ ...postDetails, description: e.target.value })
              }
            ></textarea>

            <div className="w-100" style={{ margin: "20px 0px" }}>
              <p className="fs-m-normal primary-text-color">Advanced Options</p>

              <div
                className={`flex ai-start jc-sb w-100 m-t-20 ${styles.options}`}
              >
                <div>
                  <p>Hide like and views count on this post</p>
                  <span>
                    {
                      "Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people's posts, go to your account settings."
                    }
                  </span>
                </div>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  onChange={() => setViewsAndLikesHide(!viewsAndLikesHide)}
                />
              </div>

              <div
                className={`flex ai-start jc-sb w-100 ${styles.options}`}
                style={{ marginTop: "30px" }}
              >
                <div>
                  <p>Turn off Comments</p>
                  <span>
                    You can change this later by going to the ··· menu at the
                    top of your post.
                  </span>
                </div>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  onChange={(e) => setCommentsOff(!commentsOff)}
                />
              </div>
            </div>

            {loading ? (
              <button
                className={`btn highlight-bg-color c-pointer fw-600 fs-m-normal w-100 ai-center jc-center m-t-10 primary-text-color br-10  ${styles.share}`}
                style={{ color: "#005fa3" }}
              >
                Share
              </button>
            ) : (
              <button
                className={`btn highlight-bg-color c-pointer fw-600 fs-m-normal w-100 ai-center jc-center m-t-10  primary-text-color br-10 ${styles.share}`}
                onClick={createNewPost}
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
