import { ADD_STORY } from "@/graphQl/mutations";
import { OWN_STORY } from "@/graphQl/queries";
import { handleLoadingTask, handleOpenStoryBox } from "@/slice/moreSlice";
import { addStory, handleloadStory } from "@/slice/storySlice";
import { RootState } from "@/store/store";
import styles from "@/styles/CreateStory.module.css";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation } from "@apollo/client";
import { FC, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import {
  MdOutlineDone,
  MdOutlineZoomInMap,
  MdZoomOutMap,
} from "react-icons/md";
import { TbRectangle, TbRectangleVertical, TbSquare } from "react-icons/tb";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

interface CreateStoryProps {}

const CreateStory: FC<CreateStoryProps> = ({}) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [preview, setPreview] = useState<any>(null);
  const [createStoryMutation] = useMutation(ADD_STORY);
  const [cover, setCover] = useState<boolean>(false);
  const [textVisible, setIsTextVisible] = useState<boolean>(false);
  const [imgToggle, setImageToggle] = useState<number>(0);
  const [zoom,setZoom] = useState<number>(100)
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();
    }
  }, [textVisible]);

  
     
  function bytesToMegabytes(bytes:any):number {
    return parseInt((bytes / (1024 * 1024)).toFixed(2))
}

  const handleUploadFile = (e: any) => {
    let file = e.target.files[0];

    if (e.target.files.length < 1) {
      alert("Please select only one image at a time.");
      file = null;
      return;
    }

    if (!file) return bottomNotification(dispatch, "Please select a valid file");

      if(file.type.includes("video")){
        bottomNotification(dispatch, "Only images are allowed");
        file = null;
        return;
      }

      const size = bytesToMegabytes(file.size)
      if(size > 10){
        bottomNotification(dispatch, "File size exceeds 30 MB upload limit.");
        file = null;
        return;
      }


    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const createStory = async () => {
    try {
      dispatch(handleLoadingTask(true));
      dispatch(handleloadStory(true));

      const response = await createStoryMutation({
        variables: {
          selfData: preview,
          userId: loggedInUser.id,
          dataType: preview?.startsWith("data:image/") ? "image" : "video",
          objectFit:
           imgToggle === 0
          ? "square"
          : imgToggle === 1
          ? "rectangle"
          : "reel",
          zoom:zoom,
        },
        update(cache, { data }) {
          const addStory = cache.readQuery({
            query: OWN_STORY,
            variables: {
              userId: loggedInUser.id,
            },
          });

          cache.writeQuery({
            query: OWN_STORY,
            data: {
              ownStory: data.addStory,
            },
          });
        },
      });
      const data = await response.data;
      dispatch(addStory(data?.addStory));
      dispatch(handleLoadingTask(false));
      dispatch(handleOpenStoryBox(false));
      bottomNotification(dispatch, "New story added");
      setPreview(null);
    } catch (err) {
      bottomNotification(
        dispatch,
        "Cannot create new story now, try again later"
      );
    }
  };

  useEffect(()=> {

  },[zoom])

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <form
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
      onSubmit={(e) => e.preventDefault()}
    >
      <div
        className={`dark-bg-color br-20 flex ai-start jc-start f-d-c ${styles.box}`}
      >
        <div className="flex ai-center jc-sb w-100" style={{ padding: "17px" }}>
          <span></span>
          <p className="fw-600 primary-text-color fs-normal">Add Story</p>
          <AiOutlineClose
            style={{ color: "white", fontSize: "23px" }}
            onClick={() => {
              dispatch(handleOpenStoryBox(false));
              setPreview(null);
            }}
          />
        </div>

        <div
          className="flex-grow w-100 h-100 flex ai-center jc-center relative"
          style={{ padding: "10px 10px 30px 10px" }}
        >
          <div
            className={`h-100 dark-mid-bg-color br-15 relative of-hidden ${styles.story}`}
          
            ref={containerRef}
          >
            {/* {preview ? (
              <div
                className="absolute flex ai-start jc-start zi-10"
                style={{ bottom: "2%", left: "3%" }}
              >
                <div
                  className={`p-10 br-50 c-pointer flex ai-center jc-center ${styles.icons_container}`}
                >
                  {cover ? (
                    <MdZoomOutMap onClick={() => setCover(!cover)} />
                  ) : (
                    <MdOutlineZoomInMap onClick={() => setCover(!cover)} />
                  )}
                </div>

                <div
                  className={`p-10 br-50 c-pointer flex ai-center jc-center ${styles.icons_container}`}
                  style={{ color: "green" }}
                  onClick={createStory}
                >
                  <MdOutlineDone style={{ color: "white" }} />
                </div>
              </div>
            ) : null} */}

            {preview !== null ? (
              preview.includes("video/mp4") ? (
                <ReactPlayer
               playing={true}
                 height="100%"
                  url={preview}
                  autoPlay={true}
                  muted={true}
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
              src={preview}
                  alt="file"
                 
                  style={
                    {aspectRatio:imgToggle == 0 ? "1/1" : imgToggle === 1 ? "16/9" : "9/16",width:`${zoom}%`}}
                />
              )
            ) : null}
          { !preview || preview.includes("video/mp4") ? null : (
                  <div className={`flex ai-start jc-start w-100 f-d-c ${styles.options}`}>
             <input type="range" defaultValue={100} min={60} max={100} style={{width:"93%",height:"3px",marginBottom:"15px"}} onChange={(e)=>{
             parseInt(e.target.value) > 60 ? setZoom(parseInt(e.target.value)) : null
             }}/>
                   <div className="flex ai-center jc-center">
                   <div
                      className={`flex  br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 0 ? styles.active_format : null}`}
                      onClick={() => setImageToggle(0)}
                    >
                
                    <p>1:1</p>
                    </div>


                      
                    <div
                      className={`flex  br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 1 ? styles.active_format : null}`}
                      onClick={() => setImageToggle(1)}
                    >
                  
                    <p>16:9</p>
                    </div>


                    <div
                      className={`flex  br-50 c-pointer ai-center js-center ${
                        styles.size_options
                      } ${imgToggle === 2 ? styles.active_format : "" }`}
                      onClick={() => setImageToggle(2)}
                    >
                   
                    <p>9:16</p>
                    </div>

                    <div
                  className={`p-10 br-50 c-pointer flex ai-center jc-center ${styles.size_options}`}
                  style={{ color: "white"}}
                  onClick={createStory}
                >
                 Upload
                </div>
                   </div>

                  </div>
                )}
          </div>



        </div>

        {preview === null ? (
          <div className="p-10 w-100">
            <input
              type="file"
              id="choose_file"
              style={{ display: "none" }}
              onChange={handleUploadFile}
            />
            <label htmlFor="choose_file">
              <p
                className={`btn fs-m-normal highlight-text-color h-b c-pointer br-50  w-100 ${styles.ajljs}`}
                style={{ textAlign: "center", padding: "13px" }}
              >
                Choose from gallery
              </p>
            </label>
          </div>
        ) : null}
      </div>
    </form>
  );
};

export default CreateStory;
