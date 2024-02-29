import VisibleElementTracker from "@/components/VisibleElementTracker";
import { SAVED_POSTS } from "@/graphQl/queries";
import { handleLoadingTask } from "@/slice/moreSlice";
import { handleSelectedPost, handleViewPost } from "@/slice/postSlice";
import { addLoadedSavedPosts, setSavePost } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/Saved.module.css";
import { PostType } from "@/types/types";
import { useQuery } from "@apollo/client";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { FaSadTear } from "react-icons/fa";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

interface SavedProps {}

const Saved: FC<SavedProps> = ({}) => {
  const dispatch = useDispatch();
  const [offset, setOffset] = useState<number>(0);
  const savedPosts: PostType[] = useSelector(
    (state: RootState) => state.user.savedPosts
  );
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  const { loading, data, error } = useQuery(SAVED_POSTS, {
    variables: {
      userId: loggedInUser.id,
      skip: offset,
    },
    skip: loggedInUser.id === "",
  });

  useEffect(() => {
    dispatch(handleLoadingTask(true));
    if (loading) return;
    if (data?.savedPostAndReels) {
      if (savedPosts.length <= 0) {
        dispatch(setSavePost(data?.savedPostAndReels));
      } else {
        if (data?.savedPostAndReels && Array.isArray(data?.savedPostAndReels)) {
          const isPresent = data?.savedPostAndReels.every((item: any) =>
            savedPosts.some((savedItem) => savedItem.id === item.id)
          );

          if (!isPresent) {
            dispatch(addLoadedSavedPosts(data?.savedPostAndReels));
          }
        }
      }
      dispatch(handleLoadingTask(false));
    }
  }, [loading]);

  return (
    <>
      <Head>
        <title>ShareSpace • Saved posts</title>
      </Head>
      <div className={`w-100 flex ai-center jc-start primary-text-color f-d-c ${styles.Container}`}>
        {savedPosts.length <= 0 && !loading? (
          <div className={`flex ai-center jc-center f-d-c w-100 p-20 ${styles.Template}`}>
            <FaSadTear />
            <p className="primary-text-color m-t-30">No Saved Found</p>
            <span>{"Sorry, u haven't saved any posts or reels yet"}</span>
            <button className="btn primary-text-color dark-mid-bg-color br-10 m-t-20 c-pointer ">Back To Home</button>
          </div>
        ) : (
          <>
            {" "}
            <h2 className="fs-large w-100 p-10 m-b-10">All posts</h2>
            <div className={styles.Saved}>
              {loading ? (
                <>
                  <div className={styles.Loading_Box}></div>
                  <div className={styles.Loading_Box}></div>
                  <div className={styles.Loading_Box}></div>
                  <div className={styles.Loading_Box}></div>
                  <div className={styles.Loading_Box}></div>
                  <div className={styles.Loading_Box}></div>
                </>
              ) : (
                savedPosts.map((post) => {
                  return (
                    <div key={post.id} className={styles.Box} onClick={() => { dispatch(handleViewPost(true)); dispatch(handleSelectedPost(post)) }}>
                      {post.uploadedData[0].includes("mp4") ? (
                        <ReactPlayer
                          url={post.uploadedData[0]}
                          width="100%"
                          height="100%"
                          playing={false}
                          muted={true}
                          controls={false}
                        />
                      ) : (
                        <img src={`${post.uploadedData[0]}`} alt="" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
        {(loading && savedPosts.length <= 0) ||
        loggedInUser.savedPosts.length + loggedInUser.savedReels.length ===
          savedPosts.length ? null : (
          <div className={styles.elem_tracker}>
            <VisibleElementTracker
              offset={offset}
              setOffset={setOffset}
              page="savedPosts"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Saved;
