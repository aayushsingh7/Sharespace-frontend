import Story from "@/components/Story";
import { handleOpenStoryBox } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import { StoryType, UserType } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useDispatch, useSelector } from "react-redux";

interface CarouselStorySliderProps {
  data: StoryType[];
}

const CarouselStorySlider: FC<CarouselStorySliderProps> = ({ data }) => {
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const ownStory: any = useSelector((state: RootState) => state.story.myStory);
  const dispatch = useDispatch();

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 10,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1400 },
      items: 9,
    },
    tablet: {
      breakpoint: { max: 1400, min: 800 },
      items: 9,
    },
    mobile: {
      breakpoint: { max: 800, min: 450 },
      items: 6,
    },
    mobile2: {
      breakpoint: { max: 450, min: 0 },
      items: 5,
    },
  };

  return (
    <Carousel
      responsive={responsive}
      className="w-100 main-bg-color flex ai-center c-start relative p-0-20"
    >
      {ownStory?.id ? (
        <Link href={`/story/${ownStory.id}`}>
          <div
            className="stories-container h-100 main-bg-color flex ai-center jc-center f-d-c m-r-15"
            style={{ width: "100%" }}
          >
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
                  <Image
                  //@ts-ignore
                    src={`${loggedInUser.profilePic}`}
                    alt=""
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
          className="story-container flex ai-center jc-center f-d-c"
          style={{ width: "100%" }}
          onClick={() => dispatch(handleOpenStoryBox(true))}
        >
          <div className="story-children relative of-hidden">
            <AiOutlinePlus className="add-icon" />

            {
              <Image
              //@ts-ignore
                src={`${loggedInUser.profilePic}`}
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

      {data?.map((story) => {
        return <Story key={story.id} data={story} />;
      })}
    </Carousel>
  );
};

export default CarouselStorySlider;
