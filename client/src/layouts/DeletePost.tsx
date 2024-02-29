import { FC } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ReactPlayer from "react-player";
import { FaPlay } from "react-icons/fa";
import { handleDeleteConfirmation } from "@/slice/moreSlice";

interface DeletePostProps {}

const DeletePost: FC<DeletePostProps> = ({}) => {
  const dispatch = useDispatch();
  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  return (
    <div
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex f-d-c delete-box">
        <p className="fs-large primary-text-color w-100 b-bottom-light fw-600 ffd p-15">
          Delete {selectedPost?.dataType}
        </p>
        <div className="p-20 flex ai-center jc-start f-d-c relative flex-1 h-100 w-100 of-y-scroll">
          <p className="primary-text-color m-b-20">
            <span className="fw-600" style={{ color: " #eb0000" }}>
              Warning:
            </span>{" "}
            {`are you sure u want to delete this ${selectedPost?.dataType}?`}
          </p>

          <div
            className="flex ai-center jc-start f-d-c of-hidden c-pointer dark-mid-bg-color"
            style={{
              borderRadius: "15px",
              maxWidth: "400px",
              minHeight: "340px",
              maxHeight: "340px",
            }}
          >
            <div
              className="relative kjjfe jj"
              style={{ width: "300px", height: "350px" }}
            >
              {selectedPost.uploadedData[0].includes(".mp4") ? (
                <>
                  <ReactPlayer
                    url={`${selectedPost?.uploadedData[0]}`}
                    width="100%"
                    height="100%"
                    loop={true}
                    playing={false}
                    muted={true}
                    //   ref={videoRef}
                    style={{ objectFit: "cover" }}
                  />
                  <FaPlay
                    className="absolute primary-text-color zi-10"
                    style={{ left: "2%", bottom: "5%" }}
                  />
                </>
              ) : (
                <Image
                  src={`${selectedPost.uploadedData[0]}`}
                  alt=""
                  fill={true}
                  loading="lazy"
                  objectFit="cover"
                />
              )}
            </div>
            {selectedPost?.description ? (
              <div
                className="w-100  primary-text-color fs-small"
                style={{ padding: "16px" }}
              >
                <p className="wk-bo" style={{ WebkitLineClamp: "2" }}>
                  {selectedPost?.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex ai-start jc-start w-100 btn-con">
          <button
            className="can w-100"
            onClick={() => dispatch(handleDeleteConfirmation(false))}
          >
            Cancle
          </button>
          <button className="del w-100">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeletePost;
