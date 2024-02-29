import { FC, useEffect, useRef, useState } from "react";
import {  CommentType} from "@/types/types";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLine,
} from "react-icons/ai";
const ReplyBox = dynamic(()=> import("./Reply"),{ssr:false})
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { GET_COMMENTS, REPLYS } from "@/graphQl/queries";
import { useDispatch, useSelector } from "react-redux";
import {
  addLoadedReplys,
  dislikeComment,
  likeComment,
  setLoadedReplys,
} from "@/slice/postSlice";
import { RootState } from "@/store/store";
import { DELETE_COMMENT, LIKE_COMMENT, NEW_NOTIFICATION } from "@/graphQl/mutations";
import manageLikeNotification from "@/utils/manageLikeNotification";
import deleteCommentFunction from "@/utils/deleteComment";
import dynamic from "next/dynamic";

interface CommentProps {
  data: CommentType;
  replying?: boolean;
  setComment: Function;
  setReplying: Function;
  setSelectedCommentId: Function;
  commentOffset: number;
  setSelectedComment:Function;
  socket:any;
  calculateOffOfComments:Function;
}

const Comment: FC<CommentProps> = ({
  data,
  setComment,
  setReplying,
  setSelectedCommentId,
  commentOffset,
  setSelectedComment,
  socket,
  calculateOffOfComments
}) => {
  const [showReplys, setShowReplys] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [offset, setOffset] = useState<number>(0);
  const oneTimeUsedRef = useRef<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [likeAndDislikeCommentMutation] = useMutation(LIKE_COMMENT);
  const [loadMoreReplys, setLoadMoreReplys] = useState<boolean>(false);
  const [newNotificationMutation] = useMutation(NEW_NOTIFICATION)
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT)
  const client = useApolloClient()
  const [deleteCommentLoading,setDeleteCommentLoading] =useState<boolean>(false)

  const selectedPost = useSelector(
    (state: RootState) => state.post.selectedPost
  );
  const [updatedData, setUpdatedData] = useState({
    ...data,
  });

  function highlightMentions(text: string) {
    const mentionRegex = /(@\w+)/g;
    const highlightedText = text.replace(
      mentionRegex,
      '<span style="color:#0095ff;">$1</span>'
    );
    return highlightedText;
  }
  const highlightedText = highlightMentions(updatedData?.text);

  const {
    loading: replysLoading,
    data: replysData,
    error: replysError,
    refetch,
  } = useQuery(REPLYS, {
    variables: {
      commentId: updatedData.id,
      offset: offset,
    },
    skip: !showReplys,
  });

  const loadInitialReply = async () => {
    console.log("loadInitialReplys is loading for some reason")
    if (oneTimeUsedRef.current) return;

    setLoading(true);

    const replyData = await refetch();
    const replyDataResponse = await replyData?.data;

    const {getComments} = client.readQuery({
      query:GET_COMMENTS,
      variables:{
        postId: selectedPost?.id,
        offset:calculateOffOfComments(data.id)
      }
    })

    // if(!comm) return;

    const updateCommentReplys = getComments.map((comment:CommentType)=> {
      if(comment.id === data.id){
        return {
          ...comment,
          replys:replyDataResponse.replys
        }
      }else{
        return comment;
      }
    })

    client.writeQuery({
      query:GET_COMMENTS,
      variables:{
         postId: selectedPost?.id,
          offset:calculateOffOfComments(data.id)
      },
      data:{
        //@ts-ignore
      getComments:updateCommentReplys
      }
    })

    dispatch(
      setLoadedReplys({
        commentId: data.id,
        replys: replyDataResponse.replys,
      })
    );

    setLoading(false);
    setOffset((old) => {
      return old + 10;
    });
  };

  const loadMoreReplysFunc = async () => {
    try {
    console.log("loadMoreReplyFunc is loading for some reason")
      setLoadMoreReplys(true);
      const replyData = await refetch();
      const replyDataResponse = await replyData?.data;


      const {getComments} = client.readQuery({
        query:GET_COMMENTS,
        variables:{
          postId: selectedPost?.id,
          offset:calculateOffOfComments(data.id)
        }
      })
  
      // if(!comm) return;
  
      const updateCommentReplys = getComments.map((comment:CommentType)=> {
        if(comment.id === data.id){
          return {
            ...comment,
            replys:[...comment.replys,...replyDataResponse.replys]
          }
        }else{
          return comment;
        }
      })
  
      client.writeQuery({
        query:GET_COMMENTS,
        variables:{
           postId: selectedPost?.id,
            offset:calculateOffOfComments(data.id)
        },
        data:{
          //@ts-ignore
        getComments:updateCommentReplys
        }
      })

      

      //@ts-ignore
      if (replyDataResponse?.replys) {
        dispatch(
          //@ts-ignore
          addLoadedReplys({
            commentId: data.id,
            replys: replyDataResponse.replys,
          })
        );

        setOffset((old) => {
          return old + 10;
        });
        setLoading(false);
        setLoadMoreReplys(false);
        setShowReplys(true)
      }

    } catch (err) {
      console.log(err);
    }
  };

  const addLikeFunction = async () => {
    try {
      dispatch(likeComment({ commentId: data.id, userId: loggedInUser.id }));
      const response = await likeAndDislikeCommentMutation({
        variables: {
          commentId: data?.id,
          userId: loggedInUser.id,
          dataType: "like",
        },
        update(cache, {}) {
          //@ts-ignore
          const { getComments } = cache.readQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost.id,
              offset: commentOffset,
            },
          });

          const getCommentsArray = getComments ? getComments : [];
          const updatedComments = getCommentsArray.map(
            (comment: CommentType) => {
              if (comment.id === data.id) {
                return {
                  ...comment,
                  likes: [...comment.likes, loggedInUser.id],
                };
              } else {
                return comment;
              }
            }
          );

          cache.writeQuery({
            query: GET_COMMENTS,
            data: {
              getComments: updatedComments,
            },
          });
        },
      });
      let d = await response.data;
      manageLikeNotification(socket,loggedInUser,selectedPost,newNotificationMutation,"",updatedData)
    } catch (err) {
      console.log(err);
    }
  };

  const dislikeFunction = async () => {
    try {
      dispatch(dislikeComment({ commentId: data.id, userId: loggedInUser.id }));
      const response = await likeAndDislikeCommentMutation({
        variables: {
          commentId: data?.id,
          userId: loggedInUser.id,
          dataType: "unlike",
        },
        update(cache, {}) {
          //@ts-ignore
          const { getComments } = cache.readQuery({
            query: GET_COMMENTS,
            variables: {
              postId: selectedPost.id,
              offset: commentOffset,
            },
          });

          const getCommentsArray = getComments ? getComments : [];
          const updatedComments = getCommentsArray.map(
            (comment: CommentType) => {
              if (comment.id === data.id) {
                return {
                  ...comment,
                  likes: comment.likes.filter((uId) => uId !== loggedInUser.id),
                };
              } else {
                return comment;
              }
            }
          );

          cache.writeQuery({
            query: GET_COMMENTS,
            data: {
              getComments: updatedComments,
            },
          });
        },
      });
    } catch (err) {
      console.log(err);
    }
  };


  
  
  return (
    <div
      className={`flex ai-start jc-start w-100 relative comment-box-container ${data?.loading ? "adding-comment-loading" : ""}`}
    >
      <div className="flex ai-start jc-start w-100 f-d-c">
        <div className="flex ai-start jc-start w-100">
          <div className="comment">
            <img src={data?.user.profilePic} alt="" className="br-50" />
          </div>

          <div className="flex primary-text-color f-d-c" style={{marginLeft:"20px",lineHeight:"1.4rem"}}>
            <p style={{ display: "inline", color: "white", fontSize: "1rem" }}>
              {data?.user.username}{" "}
              {data?.loading ? (
                <span className="fw_600 relative highlight-text-color" style={{marginLeft:"3px",top:"-1px"}} >posting...</span>
              ) : null}
            </p>
            <p
              style={{ fontSize: "1rem", color: "rgb(225 225 225)" }}
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
            {
              data?.loading ? null : 
              <div className="flex ai-start jc-start jj-span" style={{marginTop:"5px"}}>
              <button
            className="c-pointer bg-none b-none secondary-text-color fw-600 fs-small c_pointer"
             
              onClick={() => {
                setComment(`@${updatedData?.user.username} `);
                setReplying(true);
                setSelectedCommentId(updatedData?.id);
                setSelectedComment(updatedData)
              }}
            >
              Reply
            </button>
            
            <button
            className="c-pointer bg-none b-none secondary-text-color fw-600 fs-small c_pointer"
              style={{

                marginLeft:"10px"
              }}
              onClick={() => {
                deleteCommentFunction(data.id, deleteCommentMutation, dispatch, data.isReply, setDeleteCommentLoading,calculateOffOfComments(data.id),selectedPost,data.id);
              }}>
              Delete
            </button>
            </div>
            }
          </div>
        </div>

        <div className="flex ai-start jc-start w-100 f-d-c relative" style={{marginLeft:"40px",marginTop:"10px"}}>

          {data?.totalReplys && data?.totalReplys > 0 ? (
            showReplys ? (
              loading ? (

                <p className="fs-small fw-600 relative temp-p c-pointer"><AiOutlineLine className="comment--border" /> Loading...</p>
              ) : (
                <p
                  onClick={() => setShowReplys(false)}
                  className="fs-small fw-600 relative temp-p c-pointer"
          >
                   <AiOutlineLine className="comment--border" />
                  Hide all replies
                </p>
              )
            ) : (
              <p
                onClick={() => {
                  setShowReplys(true);
                  loadInitialReply();
                  oneTimeUsedRef.current = true;
                }}
                className="fs-small fw-600 relative temp-p c-pointer"
              >
                 <AiOutlineLine className="comment--border" />
                {`View all ${data?.totalReplys} replies`}
              </p>
            )
          ) : null}

          {showReplys && !loading ? (
            <>
              {data?.replys?.map((comment: CommentType) => {
                return (
                  <ReplyBox
                    key={comment.id}
                    data={comment}
                    commentId={data?.id}
                    replyOffset={offset}
                    setComment={setComment}
                    setReplying={setReplying}
                    setSelectedCommentId={setSelectedCommentId}
                    setSelectedComment={setSelectedComment}
                    socket={socket}
                    commentOffset={calculateOffOfComments(data.id)}
                  />
                );
              })}
            </>
          ) : null}

          {offset < data?.totalReplys &&
          showReplys &&
          data?.replys?.length >= 10 &&
          !loading ? (
            <p
              onClick={() => {
                loadMoreReplys ? null : loadMoreReplysFunc();
              }}
              style={{
                cursor: "pointer",
                color: "#888",
                fontWeight: "600",
                fontSize: "0.9rem",
                marginTop: "3px",
                marginBottom: "6px",
                padding: "0px 0px 0px 20px",
                position: "relative",
                marginLeft: "17px",
              }}
            >
          <AiOutlineLine className='comment--border' />
              {offset < data?.totalReplys
                ? loadMoreReplys ? 'Loading...' : `Show more replies`
                : null}
            </p>
          
          ) : null}
        </div>
      </div>

      <div className="flex ai-center jc-center f-d-c comment_svg" style={{marginLeft:"10px",marginTop:"5px"}}>
        {
         data?.loading ? null : 
          //@ts-ignore
         <>{
          data?.likes.includes(`${loggedInUser.id}`) ? (
            <AiFillHeart style={{ color: "red" }} onClick={dislikeFunction} />
          ) : (
            <AiOutlineHeart className="secondary-text-color"  onClick={addLikeFunction} />
          )
        }
        <span className="secondary-text-color fs-small" style={{marginTop:"4px"}}>{data.likes.length}</span>
         </>
        }
      </div>

      {data?.loading ? (
        <div className="comment--loader">
          <span></span>
        </div>
      ) : null}
    </div>
  );
};

export default Comment;
