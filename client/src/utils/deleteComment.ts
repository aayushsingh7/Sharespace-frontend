import { deleteComment } from "@/slice/postSlice";
import bottomNotification from "./handleBottomNotification";
import { CommentType, PostType } from "@/types/types";
import { GET_COMMENTS } from "@/graphQl/queries";

const deleteCommentFunction = async (
  commentId: string | any,
  deleteCommentMutation: any,
  dispatch: any,
  isReply: boolean,
  setLoading: Function,
  offset: number,
  selectedPost?: PostType,
  selectedCommentId?: string,
  replyId?: string
) => {
  setLoading(true);
  try {
    console.log(commentId, isReply);
    const removeComment = await deleteCommentMutation({
      variables: {
        commentId: commentId,
        isReply: isReply,
        replyId: replyId,
      },
      //@ts-ignore
      update(cache, { data }) {
        if (isReply) {
          const { getComments } = cache.readQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost?.id,
              offset: offset,
            },
          });

          const updateCommentsArray = getComments.map(
            (comment: CommentType) => {
              if (comment.id === selectedCommentId) {
                return {
                  ...comment,
                  totalReplys: comment.totalReplys - 1,
                  isReply: false,
                  replys: comment.replys.filter(
                    (reply) => reply.id !== replyId
                  ),
                };
              } else {
                return comment;
              }
            }
          );

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost?.id,
              offset: offset,
            },
            data: {
              getComments: updateCommentsArray,
            },
          });
        } else {
          const comments = cache.readQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost?.id,
              offset: offset,
            },
          });

          if (!comments) return;

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost?.id,
              offset: offset,
            },
            data: {
              getComments: comments?.getComments.filter(
                //@ts-ignore
                (comment) => comment.id !== commentId
              ),
            },
          });
        }
      },
    });
    setLoading(false);
    dispatch(deleteComment({ commentId, isReply, replyId }));
  } catch (err) {
    bottomNotification(
      dispatch,
      "Cannot remove comment at the moment, try later"
    );
    setLoading(false);
    console.log("comment Error", err);
  }
};

export default deleteCommentFunction;
