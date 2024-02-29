import { CommentType, PostType, ReelType, UserType } from "@/types/types";

const manageLikeNotification = async (
  socket: any,
  loggedInUser: UserType,
  selectedPost: PostType | ReelType,
  newNotificationMutation: any,
  type?: string,
  selectedComment?:any,
) => {
  try {
    
    if(type === "post_and_reels_like" && selectedPost.postedBy?.id === loggedInUser.id) return;
    if(selectedComment?.user.id === loggedInUser.id) return;

    let variables =
      type === "post_and_reels_like"
        ? selectedPost.dataType === "post"
          ? {
              receiverId: selectedPost?.postedBy?.id,
              senderId: loggedInUser.id,
              subject: "liked your post",
              postId: selectedPost.id,
              notificationType: "liked",
            }
          : {
              receiverId: selectedPost?.postedBy?.id,
              senderId: loggedInUser.id,
              subject: "liked your reel",
              reelId: selectedPost.id,
              notificationType: "liked",
            }
        :  {
            receiverId: selectedComment?.user.id,
            senderId: loggedInUser.id,
            text: selectedComment.text,
            subject: "liked your comment:",
            reelId: selectedPost.id,
            notificationType: "liked",
          };

    const newNotification = await newNotificationMutation({
      variables: variables,
    });

    const data = newNotification.data;
    socket.emit("NEW_NOTIFICATION_RECEIVED", data?.newNotification);
  } catch (err) {
    console.log(err);
  }
};

export default manageLikeNotification;
