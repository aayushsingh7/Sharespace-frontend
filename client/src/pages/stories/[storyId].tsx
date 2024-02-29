import { FC, useEffect, useRef, useState } from "react";
import styles from "@/styles/StoryPage.module.css";
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { StoryType } from "@/types/types";
import { useRouter } from "next/router";
import StoryBox from "@/components/StoryBox";
import { useMutation, useQuery } from "@apollo/client";
import { VIEW_STORY } from "@/graphQl/mutations";
import { setStories, storySeen } from "@/slice/storySlice";
import { STORIES } from "@/graphQl/queries";

interface StoryProps {}

const Story: FC<StoryProps> = ({}) => {
  const sliderRef = useRef<any>(null);
  const router = useRouter();
  const [position, setPosition] = useState<any>();
  const prevStory = useRef<any>(undefined);
  const currStory = useRef<any>(undefined);
  const nextStory = useRef<any>(undefined);
  const stories = useSelector((state: RootState) => state.story.stories);
  const [showPrev, setShowPrev] = useState<boolean>(false);
  const [timmer, setTimmer] = useState<number>(0);
  const [storySeenMutation] = useMutation(VIEW_STORY);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const { loading, data, error } = useQuery(STORIES, {
    variables: {
      userId: loggedInUser.id,
    },
  });

  useEffect(() => {
    setStoryLoading(true);
    if (data?.stories) {
      dispatch(setStories(data?.stories));
      setStoryLoading(false);
    }
  }, [loading]);

  const prevClick = () => {
    router.push(`/stories/${prevStory.current.id}`);
    setPosition((p: number) => {
      return p + 100;
    });
  };

  const nextClick = () => {
    if (!nextStory.current) return router.push("/");
    router.push(`/stories/${nextStory.current.id}`);
    setPosition((p: number) => {
      return p - 100;
    });
  };

  useEffect(() => {
    currStory.current = undefined;
    prevStory.current = undefined;
    nextStory.current = undefined;

    currStory.current = stories?.find((story: StoryType) => {
      return story.id === router.query.storyId;
    });

    if (currStory.current) {
      //@ts-ignore
      const index = stories.indexOf(currStory.current);
      prevStory.current = stories[index - 1];
      nextStory.current = stories[index + 1];
    }

    if (prevStory.current) {
      setShowPrev(true);
    } else {
      setShowPrev(false);
    }
  }, [router.query.storyId, position]);

  const storyPosition = stories.findIndex(
    (story: StoryType) => story.id === router.query.storyId
  );

  useEffect(() => {
    setPosition((old: number) => {
      return parseInt(`-${storyPosition}00`);
    });
  }, [storyPosition]);

  const handleStorySeen = async () => {
    try {
      const response = await storySeenMutation({
        variables: {
          storyId: router.query.storyId,
          seenBy: loggedInUser.id,
        },
      });

      let data = await response.data;

      dispatch(
        storySeen({
          type: "others",
          userId: loggedInUser.id,
          storyID: router.query.storyId,
        })
      );
    } catch (err) {}
  };

  return (
    <div className={`flex jc-center w-100 h-100 relative of-hidden ${styles.Container}`}>
      <div className={`relative ${styles.Story_Box}`}>
        {showPrev ? (
          <button className={`btn p-10 br-50 of-hidden flex ai-center jc-center c-pointer of-hidden ${styles.Prev_button}`} onClick={prevClick}>
            <AiOutlineLeft />
          </button>
        ) : null}

        <div className={`flex w-100 h-100 of-hidden relative br-10 ${styles.slider_container}`}>
            {storyLoading ? (
              <div className="loading-template h-100 w-100"></div>
            ) : (
              <div
                className={`w-100 h-100 flex ai-start jc-start absolute ${styles.slider}`}
                ref={sliderRef}
                style={{ left:storyLoading ? "0" : `${position}%` }}
              >
             { stories.map((story: StoryType) => (
                <StoryBox
                  story={story}
                  nextClick={nextClick}
                  key={story.id}
                  currStory={currStory.current}
                  handleStorySeen={handleStorySeen}
                />
              ))}
          </div>
            )}
        </div>

        <button className={`btn p-10 br-50 of-hidden flex ai-center jc-center c-pointer of-hidden ${styles.Next_button}`} onClick={nextClick}>
          <AiOutlineRight />
        </button>
      </div>

      <AiOutlineClose
        className={styles.close}
        onClick={() => router.push("/")}
      />
    </div>
  );
};

export default Story;
