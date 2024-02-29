import Post from "@/components/Post";
import { FC } from "react";
import styles from "../styles/Home.module.css";

import LoadingPost from "@/components/LoadingPost";
import VisibleElementTracker from "@/components/VisibleElementTracker";
import {
  OWN_STORY,
  POSTS,
  STORIES,
} from "@/graphQl/queries";
import CarouselStorySlider from "@/layouts/CarouselStorySlider";
import LoadingStories from "@/layouts/LoadingStories";
import PhoneTopNavbar from "@/layouts/PhoneTopNavbar";
import { handleLoadingTask } from "@/slice/moreSlice";
import { addLoadedPosts, setFeedPosts } from "@/slice/postSlice";
import { addStory, setStories } from "@/slice/storySlice";
import { followSuggestions } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import { PostType } from "@/types/types";
import { useApolloClient, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import StorySlider from "@/layouts/StorySlider";

interface IndexProps {
  props: any;
}

const Index: FC<IndexProps> = ({ props }) => {
  console.log(props);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const feedPosts: PostType[] = useSelector(
    (state: RootState) => state.post.feedPosts
  );
  const stories = useSelector((state: RootState) => state.story.stories);
  const shouldSkipQuery = loggedInUser.id === "" || stories.length > 0;
  const [offset, setOffset] = useState<number>(0);
  const client = useApolloClient();
  const loadStory = useSelector((state: RootState) => state.story.loadStory);
  const [socket, setSocket] = useState<any>();

  const { loading, data, error, refetch } = useQuery(POSTS, {
    variables: { userId: loggedInUser.id, skip: offset },
    skip: loggedInUser?.id === "",
  });

  useEffect(() => {
    const loadMorePosts = async () => {
      try {
        if (offset === 0 || feedPosts?.length > 15) return;
        const { data } = await refetch();
        console.log("loadMorePosts data ", data);
        if (data?.posts) {
          dispatch(addLoadedPosts(data?.posts));
          //@ts-ignore
          const p = client.readQuery({
            query: POSTS,
            variables: {
              userId: loggedInUser.id,
            },
          });

          client.writeQuery({
            query: POSTS,
            variables: {
              userId: loggedInUser.id,
            },
            data: {
              posts: [...p.posts, ...data?.posts],
            },
          });
        }
      } catch (err) {}
    };

    if (loggedInUser?.id !== "") {
      loadMorePosts();
    }
  }, [offset]);

  const {
    loading: storiesLoading,
    data: storiesData,
    error: storiesError,
  } = useQuery(STORIES, {
    variables: {
      userId: loggedInUser.id,
    },
    skip: shouldSkipQuery,
    fetchPolicy:"network-only"
  });

  useEffect(() => {
    if (feedPosts.length <= 0 && loggedInUser?.id) {
      dispatch(handleLoadingTask(true));
    }
    if (data?.posts && feedPosts?.length <= 0) {
      console.log("data?.posts data ", data?.posts);
      dispatch(handleLoadingTask(false));
      dispatch(setFeedPosts(data?.posts));
    }
  }, [data]);

  useEffect(() => {
    if (storiesLoading) return;
    if (storiesError) return console.log(storiesError);
    if (storiesData?.stories) {
      dispatch(setStories(storiesData?.stories));
      //@ts-ignore
    }
  }, [storiesData]);

  const {
    loading: StoryLoading,
    data: StoryData,
    error: StoryError,
  } = useQuery(OWN_STORY, {
    variables: {
      userId: loggedInUser.id,
    },
    skip: shouldSkipQuery,
    fetchPolicy:"network-only"
  });

  useEffect(() => {
    if (!StoryLoading && loadStory) {
      if (StoryData?.ownStory) {
        console.log("StoryData?.ownStory ", StoryData?.ownStory);
        dispatch(addStory(StoryData?.ownStory));
        console.log("OwnStory Data", StoryData);
      }
    }
  }, [StoryData, StoryLoading]);

 
  useEffect(() => {
    const s = io("https://api-sharesapce-backend.onrender.com/");
    console.log("fuck this shit")
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  console.log("why its not workking pin puiblic places ")


  return (
    <div className={styles.Container}>
      <div className={styles.Posts_and_Stories_Containers}>
        <PhoneTopNavbar />

        {storiesLoading ? (
         <LoadingStories /> 
       ) : ( 
          <StorySlider loading={storiesLoading}/>
         )}

        <div className={styles.Users_Posts_Container}>
          <div className={styles.Posts_Container}>
            {feedPosts?.length <= 0 ? (
              <>
                <LoadingPost />
                <LoadingPost />
                <LoadingPost />
                <LoadingPost />
              </>
            ) : (
              feedPosts.map((post) => {
                return <Post key={post.id} data={post} socket={socket} />;
              })
            )}
            {feedPosts.length <= 0 ? null : data?.posts?.length <=0 ? <p className="w-100 p-20 fs-normal primary-text-color flex ai-center jc-center">All caught up! More coming soon.</p> : 
            (
              <VisibleElementTracker
                offset={offset}
                setOffset={setOffset}
                page={"home"}
              />
            )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
