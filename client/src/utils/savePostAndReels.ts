import { LOGGED_IN_USER, SAVED_POSTS } from "@/graphQl/queries";
import { PostType, ReelType, UserType } from "@/types/types";
import bottomNotification from "./handleBottomNotification";

const savePostAndReels = async (
  savePostAndReelsMutation: any,
  data: PostType | ReelType,
  loggedInUser: UserType,
  token: String,
  dispatch: any,
  savePost: any
) => {
  try {
    let updatedLoggedInUser;
    dispatch(savePost(data));
    bottomNotification(dispatch, "Saved");
    const userId = loggedInUser.id;
    const response = await savePostAndReelsMutation({
      variables: {
        id: data?.id,
        dataType: data?.dataType,
        userId: loggedInUser.id,
        //@ts-ignore
      },
      update(cache: any, {}) {
        //@ts-ignore
        const { loggedInUser } = cache.readQuery({
          query: LOGGED_IN_USER,
          variables: {
            cookie: token,
          },
        });

        const {savedPostAndReels} = cache.readQuery({
          query: SAVED_POSTS,
          variables: {
            userId: loggedInUser?.id,
            skip: 0,
          },
        });

        console.log("saved post (d)", savedPostAndReels)


        if (data.dataType === "post") {
          updatedLoggedInUser = {
            ...loggedInUser,
            savedPosts: [...loggedInUser.savedPosts, data.id],
          };
        } else {
          updatedLoggedInUser = {
            ...loggedInUser,
            savedReels: [...loggedInUser.savedReels, data.id],
          };
        }

        const newPost = {
          id:data?.id,
          uploadedData: data?.uploadedData,
          dataType:data?.dataType,
        };

        cache.writeQuery({
          query: SAVED_POSTS,
          variables: {
            userId: loggedInUser?.id,
            skip: 0,
          },
          data: {
            //@ts-ignore
            savedPostAndReels:[...savedPostAndReels,newPost]
          },
        });

        cache.writeQuery({
          query: LOGGED_IN_USER,
          variables: {
            cookie: token,
          },
          data: {
            loggedInUser: updatedLoggedInUser,
          },
        });
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export default savePostAndReels;
