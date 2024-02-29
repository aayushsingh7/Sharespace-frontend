import { OWN_STORY, STORY } from "@/graphQl/queries";
import { handleLoadingTask } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
// import styles from "@/styles/Story-One.module.css";
import StoryBox from "@/components/StoryBox";
import { REMOVE_STORY, VIEW_STORY } from "@/graphQl/mutations";
import {
  addStory,
  handleloadStory,
  removeStory,
  storySeen,
} from "@/slice/storySlice";
import bottomNotification from "@/utils/handleBottomNotification";

interface MyStoryProps {}

const MyStory: FC<MyStoryProps> = ({}) => {

  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [removeStoryMutation] = useMutation(REMOVE_STORY);

  const myStory: any = useSelector((state: RootState) => state.story.myStory);
  const dispatch = useDispatch();
  const router = useRouter();
  const [storySeenMutation] = useMutation(VIEW_STORY);
  const [storyLoading, setStoryLoading] = useState<boolean>(false);

  const { loading, data, error } = useQuery(STORY, {
    variables: {
   storyId:router.query.storyId
    }
  });

  
  useEffect(() => {
    setStoryLoading(true);
    if (!loading && data?.story) {
      dispatch(addStory(data.story));
      setStoryLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if(!data?.story) return;
    handleStorySeen();
  }, [loading]);

  const removeStoryFunction = async () => {
    try {
      dispatch(handleloadStory(false));
      dispatch(handleLoadingTask(true));
      const response = await removeStoryMutation({
        variables: {
          userId: loggedInUser.id,
          storyId: myStory?.id,
        },
      });
      const data = await response.data;
      dispatch(handleLoadingTask(false));
      dispatch(removeStory({}));
      router.back();
      bottomNotification(dispatch, "Story removed");
    } catch (err) {bottomNotification(dispatch,"Cannot remove story now, try again later")}
  };


  const handleStorySeen = async () => {
    try {
      const response = await storySeenMutation({
        variables: {
          storyId: myStory?.id,
          seenBy: loggedInUser.id,
        },
        update(cache, {}) {
          //@ts-ignore
          const story: any = cache.readQuery({
            query: OWN_STORY,
            variables: {
              userId: loggedInUser.id,
            },
          });

          cache.writeQuery({
            query: OWN_STORY,
            data: {
              ownStory: {
                ...story.ownStory,
                seenBy: [
                  ...story.ownStory.seenBy,
                  {
                    id: loggedInUser.id,
                    __typename: "UserType",
                  },
                ],
              },
            },
          });
        },
      });
      let data = await response.data;
      dispatch(storySeen({ type: "myself", userId: loggedInUser.id }));
    } catch (err) {}
  };

  return (
    <div
    className="flex jc-center w-100 h-100 relative ffs"

    >
   {
    router.asPath.startsWith("/story") ? null : 
    <AiOutlineClose
    style={{
      position: "absolute",
      top: "3%",
      right: "3%",
      fontSize: "30px",
      color: "white",
      cursor: "pointer",
    }}
    onClick={() => router.back()}
  />
   }

      {storyLoading || !loggedInUser.id ? (
        <div className="loading-template story-box s-box br-10"></div>
      ) : (
       <div className="w-100 ai-center jc-center flex" style={{height:"90%"}}>
         <StoryBox
          story={myStory}
          handleStorySeen={handleStorySeen}
          nextClick={() => router.push("/")}
          currStory={myStory}
        />
       </div>
      )}
    </div>
  );
};

export default MyStory;

