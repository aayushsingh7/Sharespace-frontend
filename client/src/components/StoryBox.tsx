import { RootState } from "@/store/store";
import { StoryType } from "@/types/types";
import convertPostCreatedAt from "@/utils/convertPostCreatedAt";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { useSelector } from "react-redux";

interface StoryBoxProps {
  story: StoryType;
  nextClick: Function;
  currStory: StoryType;
  handleStorySeen: Function;
}

const StoryBox: FC<StoryBoxProps> = ({
  story,
  nextClick,
  currStory,
  handleStorySeen,
}) => {
  const router = useRouter();
  const [timmer, setTimmer] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const countRef = useRef<number>(0);
  const componentRef = useRef<any>(null);
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    console.log("insdie the storyBox useEffect");
    if (router.query.storyId !== story.id && !isPaused) {
      countRef.current = 0;
      setTimmer(0);
    }

    if (router.query.storyId !== story.id) return;

    // let currValue =
    let interval: any;

    const startInterval = () => {
      interval = setInterval(() => {
        if (isPaused) {
          countRef.current = countRef.current;
        } else {
          countRef.current += 1;
        }
        setTimmer(countRef.current);

        if (countRef.current >= 100) {
          clearInterval(interval);
          setTimmer(0);
          nextClick();
        }
      }, 50);
    };

    clearInterval(interval);
    setTimmer(0);
    startInterval();

    return () => {
      clearInterval(interval);
      setTimmer(0);
    };
  }, [router.query.storyId, isPaused]);

  useEffect(() => {
    if (
      story.id === router.query.storyId &&
      //@ts-ignore
      !story.seenBy.map((u) => u.id).includes(loggedInUser.id)
    ) {
      handleStorySeen();
    }
  }, [router.query.storyId]);
  
  
  
  console.log(story)

  return (
    <div className="story-box h-100 relative" ref={componentRef}>
      <div className="absolute left-0 p-20 w-100 flex ai-start jc-start f-d-c zi-10">
        <div
          className="w-100 br-10 relative"
          style={{ background: " #cacaca90", height: "2px" }}
        >
          <p
            className="absolute left-0 h-100 br-10"
            style={{ width: `${timmer}%`, background: "white" }}
          ></p>
        </div>

        <div className="flex ai-center jc-sb w-100 m-t-10">
          <div className="flex ai-center jc-center primary-text-color">
            <Image
              src={`${story.user?.profilePic}`}
              alt=""
              height={35}
              width={35}
              style={{ objectFit: "cover", borderRadius: "50px" }}
              loading="eager"
            />
            <p className="m-l-10">{story.user?.username}</p>
            <p style={{ color: "#e0e0e0cc", marginLeft: "15px" }}>
              {convertPostCreatedAt(story.createdAt)}
            </p>
          </div>
          <div className="flex ai-center jc-center lksdfae">
            {isPaused ? (
              <FaPlay onClick={() => setIsPaused(false)} />
            ) : (
              <FaPause onClick={() => setIsPaused(true)} />
            )}
          </div>
        </div>
      </div>

      <img    className="story_img_ab" src={`${story.selfData}`} alt="" loading="eager"   style={
      {aspectRatio:story.objectFit == "square" ? "1/1" : story.objectFit == "rectangle" ? "16/9" : "9/16",width:`${story.zoom}%`}}/>
    </div>
  );
};

export default StoryBox;
