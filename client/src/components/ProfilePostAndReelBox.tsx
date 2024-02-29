import { handleDeleteConfirmation, handleEditPost } from "@/slice/moreSlice";
import { handleSelectedPost, handleViewPost } from "@/slice/postSlice";
import { PostType, ReelType } from "@/types/types";
import Image from "next/image";
import { FC, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import ReactPlayer from "react-player";
import { useDispatch } from "react-redux";

interface ProfilePostAndReelBoxProps {
  reel?: ReelType;
  post?: PostType;
}

const ProfilePostAndReelBox: FC<ProfilePostAndReelBoxProps> = ({
  reel,
  post,
}) => {
  const [options, setOptions] = useState<boolean>(false);
  const dispatch = useDispatch();
  return (
    <>
      {reel ? (
        <div
          className="w-100 relative of-hidden b"
          onClick={() => {
            dispatch(handleSelectedPost(reel));
            dispatch(handleViewPost(reel));
          }}
          onMouseLeave={() => setOptions(false)}
          onMouseEnter={() => setOptions(true)}
          key={reel.id}
          style={{
            height: "33vw",
            maxHeight: "320px",
          }}
        >
          <ReactPlayer
            url={reel.uploadedData[0]}
            width="100%"
            height="100%"
            playing={false}
            muted={true}
            controls={false}
          />
         
        </div>
      ) : post ? (
        <div
          className="w-100 relative of-hidden b relative "
          style={{
            height: "33vw",
            maxHeight: "320px",
          }}
          onClick={() => {
            dispatch(handleSelectedPost(post));
            dispatch(handleViewPost(post));
          }}
          onMouseLeave={() => setOptions(false)}
          onMouseEnter={() => setOptions(true)}
          key={post.id}
        >
          
          {post.uploadedData[0].includes(".mp4") ? (
            <>
              <FaPlay className="absolute primary-text-color zi-10" />

              <ReactPlayer
                url={post?.uploadedData[0]}
                width="100%"
                height="100%"
                playing={false}
                muted={true}
                controls={false}
              />
            </>
          ) : (
            <Image
              src={post.uploadedData[0]}
              alt=""
              fill={true}
              priority={true}
              loading="eager"
              objectFit="cover"
            />
          )}
        </div>
      ) : null}
    </>
  );
};

export default ProfilePostAndReelBox;
