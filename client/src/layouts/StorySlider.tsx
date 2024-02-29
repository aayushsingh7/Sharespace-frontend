import { FC, useEffect, useRef, useState } from "react";
import { handleOpenStoryBox } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import { StoryType, UserType } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineLeft, AiOutlinePlus, AiOutlineRight } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import Story from "@/components/Story";

interface StorySliderProps {
  loading:Boolean;
}

const StorySlider: FC<StorySliderProps> = ({loading}) => {
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const ownStory: any = useSelector((state: RootState) => state.story.myStory);
  const stories = useSelector((state: RootState) => state.story.stories);
  const dispatch = useDispatch();
  const sliderRef = useRef<any>(null);
  const [nextBtn, setNextBtn] = useState<boolean>(false);
  const [prevBtn, setPrevBtn] = useState<boolean>(false);

  useEffect(()=> {
    console.log("NextBTN is changing", nextBtn)
  },[nextBtn])

  useEffect(() => {
    if (sliderRef.current) {
      const ref = sliderRef.current;
      const handleScroll = () => {
        updateButtonState();
      };
      sliderRef.current.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      handleScroll()
      return () => {
        ref.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [stories]);

  const updateButtonState = () => {
    const container = sliderRef.current;
    const hasNext =
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
      console.log("hasNext",hasNext)
    setNextBtn(hasNext);

    const hasPrev = container.scrollLeft > 0;
    setPrevBtn(hasPrev);
  };

  const handleNextClick = () => {
    updateButtonState();
    sliderRef.current.scrollBy({
      left: sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handlePrevClick = () => {
    updateButtonState();
    sliderRef.current.scrollBy({
      left: -sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="flex ai-start jc-start w-100 relative p-0-20"
      style={{ height: "100px" }}
    >
      {prevBtn ? (
        <button
          onClick={handlePrevClick}
          className={`btn br-50 of-hidden flex ai-start jc-start c-pointer of-hidden absolute zi-100 prev-btn`}
        >
          <AiOutlineLeft />
        </button>
      ) : null}
      <div
        className="flex ai-start jc-start of-y-scroll relative w-100 h-100 wwyyxx"
        ref={sliderRef}
      >
        <div className="flex ai-center jc-start w-100 h-100 ddd">
          {ownStory?.id ? (
            <Link href={`/story/${ownStory.id}`}>
              <div className="stories-container h-100 main-bg-color flex ai-center jc-center f-d-c m-r-15">
                <div className="story-children relative">
                  <div
                    className={`story-children br-50 relative ${
                      ownStory?.seenBy
                        ?.map((user: UserType) => user.id)
                        .includes(loggedInUser.id)
                        ? "user-story-disabled"
                        : "user-story-active"
                    }`}
                  >
                    {
                     loggedInUser &&  <Image
                        //@ts-ignore
                        src={`${loggedInUser.profilePic}`}
                        priority={true}
                        alt="user-pic"
                        fill={true}
                        className="dlakjfeee br-50"
                      />
                    }
                  </div>
                </div>
                <p className="www primary-text-color w-100">Your story</p>
              </div>
            </Link>
          ) : (
            <div
              className="story-container flex ai-center jc-center f-d-c m-r-15"
              onClick={() => dispatch(handleOpenStoryBox(true))}
            >
              <div className="story-children relative of-hidden">
                <AiOutlinePlus className="add-icon" />

                {
                loggedInUser &&  <Image
                    //@ts-ignore
                    src={`${loggedInUser.profilePic}`}
                    priority={true}
                    alt="pp"
                    fill={true}
                    className="br-50"
                  />
                }
              </div>
              <p
                className="of-hidden www primary-text-color w-100"
                style={{ marginTop: "9px" }}
              >
                Add Story
              </p>
            </div>
          )}


        </div>
        { stories.map((story:StoryType) => {
          return <Story data={story} key={story.id} />
        })}

      </div>
      {nextBtn ? (
        <button
          onClick={() => handleNextClick()}
          className={`btn br-50 of-hidden flex ai-center jc-center c-pointer of-hidden absolute zi-100 next-btn`}
        >
          <AiOutlineRight />
        </button>
      ) : null}
    </div>
  );
};

export default StorySlider;
