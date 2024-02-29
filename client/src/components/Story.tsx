import { handleViewStory } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import { StoryType } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

interface StoryProps {
  data: StoryType;
}

const Story: FC<StoryProps> = ({ data }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  return (
    <div
      className="story-container main-bg-color flex ai-center jc-center f-d-c h-100"
      style={{ marginRight: "15px"}}
      onClick={() => {
        dispatch(handleViewStory(true));
        router.push(`/stories/${data?.id}`);
      }}
    >
      <div
        className={`story-children br-50 relative ${
          data?.seenBy?.map((user) => user.id).includes(loggedInUser.id)
            ? "user-story-disabled"
            : "user-story-active"
        }`}
      >
        {
          //@ts-ignore
          <Image
            className="w-100 h-100 ofit-cover br-50"
            src={`${data?.user.profilePic}`}
            alt=""
            fill={true}
          />
        }
      </div>
      <p className="of-hidden www primary-text-color w-100">
        {data?.user.username}
      </p>
    </div>
  );
};

export default Story;
