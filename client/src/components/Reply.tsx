import { DELETE_COMMENT, LIKE_COMMENT, NEW_NOTIFICATION } from "@/graphQl/mutations";
import { REPLYS } from "@/graphQl/queries";
import { dislikeReply, likeReply } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import { CommentType } from "@/types/types";
import deleteCommentFunction from "@/utils/deleteComment";
import manageLikeNotification from "@/utils/manageLikeNotification";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { FC, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

interface ReplyBoxProps {
  data: CommentType;
  commentId?: string;
  replyOffset: number;
  setReplying: Function;
  setComment: Function;
  setSelectedCommentId: Function;
  setSelectedComment: Function;
  socket: any;
  commentOffset:number;
}

const ReplyBox: FC<ReplyBoxProps> = ({
  data,
  commentId,
  replyOffset,
  setReplying,
  setComment,
  setSelectedCommentId,
  setSelectedComment,
  socket,
  commentOffset,
}) => {
  const [likeAndDislikeCommentMutation] = useMutation(LIKE_COMMENT);
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [deleteCommentLoading,setDeleteCommentLoading] = useState<boolean>(false)
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT)
  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  const [newNotificationMutation] = useMutation(NEW_NOTIFICATION);

  function highlightMentions(text: string) {
    const mentionRegex = /(@\w+)/g;
    const highlightedText = text?.replace(
      mentionRegex,
      '<span style="color:#0095ff;">$1</span>'
    );
    return highlightedText;
  }

  const inputText = data?.text;
  const highlightedText = highlightMentions(inputText);

  const addLikeFunction = async () => {
    try {
      dispatch(
        likeReply({
          commentId: commentId,
          userId: loggedInUser.id,
          replyId: data.id,
        })
      );
      const response = await likeAndDislikeCommentMutation({
        variables: {
          commentId: data?.id,
          userId: loggedInUser.id,
          dataType: "like",
        },
        update(cache, {}) {
          //@ts-ignore
          const { replys } = cache.readQuery({
            query: REPLYS,
            variables: {
              commentId: commentId,
              offset: replyOffset,
            },
          });

          const replysArray = replys ? replys : [];
          const updatedReplys = replysArray.map((reply: CommentType) => {
            if (reply.id === data.id) {
              return {
                ...reply,
                likes: [...replys.likes, loggedInUser.id],
              };
            } else {
              return reply;
            }
          });

          cache.writeQuery({
            query: REPLYS,
            data: {
              replys: updatedReplys,
            },
          });
        },
      });
      manageLikeNotification(
        socket,
        loggedInUser,
        selectedPost,
        newNotificationMutation,
        "replied",
        data
      );
      let d = await response.data;
    } catch (err) {}
  };

  const dislikeFunction = async () => {
    try {
      dispatch(
        dislikeReply({
          commentId: commentId,
          userId: loggedInUser.id,
          replyId: data.id,
        })
      );
      const response = await likeAndDislikeCommentMutation({
        variables: {
          commentId: data?.id,
          userId: loggedInUser.id,
          dataType: "unlike",
        },
        update(cache, {}) {
          //@ts-ignore
          const { replys } = cache.readQuery({
            query: REPLYS,
            variables: {
              commentId: commentId,
              offset: replyOffset,
            },
          });

          const replysArray = replys ? replys : [];
          const updatedReplys = replysArray.map((reply: CommentType) => {
            if (reply.id === data.id) {
              return {
                ...reply,
                likes: replys.likes.map(
                  (uId: string) => uId !== loggedInUser.id
                ),
              };
            } else {
              return reply;
            }
          });

          cache.writeQuery({
            query: REPLYS,
            data: {
              replys: updatedReplys,
            },
          });
        },
      });
    } catch (err) {}
  };

  return (
    <div
      className={`reply-container flex ai-start jc-start w-100 relative p-10 ${
        data?.loading ? "adding-comment-loading" : ""
      }`}
    >
      <div className="flex ai-start jc-start w-100">
        <Image
          src={`${data?.user?.profilePic}`}
          alt=""
          width={36}
          height={36}
          className="br-50"
        />

        <div
          className="flex primary-text-color f-d-c"
          style={{ lineHeight: "1.4rem", marginLeft: "20px" }}
        >
          <p style={{ display: "inline", color: "white", fontSize: "1rem" }}>
            {data?.user?.username}{" "}
            {data?.loading ? (
              <span
                className="fw-600 relative"
                style={{ marginLeft: "3px", fontSize: "13px", top: "-1px" }}
              >
                posting...
              </span>
            ) : null}
          </p>
          <p
            style={{ fontSize: "1rem", color: "rgb(225 225 225)" }}
            id="p"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
          <div className="flex ai-start jc-start jj-span" style={{marginTop:"5px"}}>
          <button
            style={{
              fontWeight: "600",
              fontSize: "0.9rem",
              
              cursor: "pointer",
            }}
            className="bg-none b-none secondary-text-color"
            onClick={() => {
              setComment(`@${data?.user.username}`);
              setReplying(true);
              setSelectedCommentId(commentId);
              setSelectedComment(data);
            }}
          >
            Reply
          </button>

          <button
            className="bg-none b-none secondary-text-color fw-600 fs-small c_pointer"
              style={{
               
                marginLeft:"10px"
              }}
              onClick={() => {
                deleteCommentFunction(commentId, deleteCommentMutation, dispatch, data.isReply, setDeleteCommentLoading,commentOffset,selectedPost,commentId, data.id);
              }}>
              Delete
            </button>
            </div>

        </div>
      </div>

      {data?.loading ? null : (
        <div
          className="flex ai-center jc-center f-d-c m-l-10 secondary-text-color"
          style={{ marginTop: "5px" }}
        >
          {data?.likes?.includes(loggedInUser.id) ? (
            <AiFillHeart style={{ color: "red",fontSize:"18px" }} onClick={dislikeFunction} />
          ) : (
            <AiOutlineHeart onClick={addLikeFunction} style={{fontSize:"18px"}} />
          )}
          <span style={{marginTop:"4px",fontSize:"14px"}}>{data?.likes?.length}</span>
        </div>
      )}

      {data?.loading ? (
        <div className="comment--loader">
          <span></span>
        </div>
      ) : null}
    </div>
  );
};

export default ReplyBox;
