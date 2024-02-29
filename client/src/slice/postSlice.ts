import Post from "@/models/post";
import { CommentType, PostType, ReelType } from "@/types/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { useRouter } from "next/router";

const initialState = {
  openCreatePost: false,
  viewPost: false,
  viewStory: false,
  sharePost: false,
  selectedPost: Post,
  feedPosts: [],
  selectedPostComments: [],
  reels: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    handleOpenCreatePost(state, action) {
      state.openCreatePost = action.payload;
    },
    handleViewPost(state, action) {
      state.viewPost = action.payload;
    },
    handleViewStory(state, action) {
      state.viewStory = action.payload;
    },
    handleSharePost(state, action) {
      state.sharePost = action.payload;
    },
    handleSelectedPost(state, action) {
      state.selectedPost = action.payload;
    },
    setFeedPosts(state, action) {
      state.feedPosts = action.payload;
    },
    setReels(state, action) {
      state.reels = action.payload;
    },
    addLoadedPosts(state, action) {
      //@ts-ignore
      state.feedPosts = state.feedPosts.concat(
        action.payload.filter((newPost: any) => {
          return !state.feedPosts.find(
            (existingPost: any) => existingPost.id === newPost.id
          );
        })
      );
    },
    addLoadedReels(state, action) {
      //@ts-ignore
      state.reels = state.reels.concat(
        action.payload.filter((newReel: any) => {
          return !state.reels.find(
            (existingReel: any) => existingReel.id === newReel.id
          );
        })
      );
    },
    //@ts-ignore
    addComment(state, action) {
      const { tempID, data } = action.payload;
      // @ts-ignore
      state.selectedPostComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === tempID) {
            return {
              ...comment,
              ...data,
            };
          } else {
            return comment;
          }
        }
      );

      // @ts-ignore
      state.feedPosts = state.feedPosts.map((post: PostType) => {
        if (post.id === state.selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, data.id],
          };
        } else {
          return post;
        }
      });

      //@ts-ignore
      state.reels = state.reels.map((reel: ReelType) => {
        console.log(
          "reel.id === state.selectedPost.id",
          reel.id === state.selectedPost.id
        );
        if (reel.id === state.selectedPost.id) {
          return {
            ...reel,
            comments: [...reel.comments, data.id],
          };
        } else {
          return reel;
        }
      });
    },
    addTempComment(state, action) {
      state.selectedPostComments = [
        // @ts-ignore
        action.payload,
        ...state.selectedPostComments,
      ];
    },
    setComments(state, action) {
      // @ts-ignore
      state.selectedPostComments = action.payload;
      // @ts-ignore
    },
    addLike(state, action) {
      state.selectedPost = {
        ...state.selectedPost,
        likes: [...state.selectedPost.likes, action.payload],
      };
    },
    addLoadedComments(state, action) {
      //@ts-ignore
      state.selectedPostComments = [
        ...state.selectedPostComments,
        ...action.payload,
      ];
    },
    removeLike(state, action) {
      state.selectedPost.likes = state.selectedPost.likes.filter(
        (userId) => userId !== action.payload
      );
    },
    addLikeFromFeedPost(state, action) {
      const { postId, userId } = action.payload;
      // @ts-ignore
      state.feedPosts = state.feedPosts.map((post) => {
        // @ts-ignore
        if (post.id === postId) {
          return {
            // @ts-ignore
            ...post,
            // @ts-ignore
            likes: [...post.likes, userId],
          };
        } else {
          return post;
        }
      });
    },
    removeLikeFromFeedPost(state, action) {
      const { userId, postId } = action.payload;
      // @ts-ignore
      state.feedPosts = state.feedPosts.map((post) => {
        // @ts-ignore
        if (post.id === postId) {
          return {
            // @ts-ignore
            ...post,
            // @ts-ignore
            likes: post.likes.filter((u) => u !== userId),
          };
        } else {
          return post;
        }
      });
    },
    //changed
    addNewPost(state, action) {
      //@ts-ignore
      state.feedPosts = [action.payload, ...state.feedPosts];
    },
    //@ts-ignore
    addLoadedReplys(state, action) {
      const { commentId, replys } = action.payload;
      const postCommentsUpdated = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replys: [...comment.replys, ...replys],
            };
          } else {
            return comment;
          }
        }
      );
      return {
        ...state,
        selectedPostComments: postCommentsUpdated,
      };
    },
    //@ts-ignore
    setLoadedReplys(state, action) {
      const { commentId, replys } = action.payload;
      const postCommentsUpdated = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replys: replys,
            };
          } else {
            return comment;
          }
        }
      );
      //@ts-ignore
      return {
        ...state,
        selectedPostComments: postCommentsUpdated,
      };
    },
    //@ts-ignore
    addNewReply(state, action) {
      const { commentId, data, tempID } = action.payload;
      console.log(
        "selectedPostComments",
        JSON.parse(JSON.stringify(state.selectedPostComments))
      );
      //@ts-ignore
      state.selectedPostComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replys:comment.replys.map((reply)=> {
                return reply.id === tempID ? 
                {
                  ...reply,
                  ...data,
                  loading:false,
                } : reply
              })
            };
          } else {
            return comment;
          }
        }
      );
    },
    //@ts-ignore
    addTemperoryReply(state, action) {
      const { commentId, data } = action.payload;
      const postCommentsUpdated = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            if (comment.replys.length <= 0) {
              return {
                ...comment,
                replys: [data],
                totalReplys: comment.totalReplys + 1,
              };
            } else {
              return {
                ...comment,
                replys: [data, ...comment.replys],
                totalReplys: comment.totalReplys + 1,
              };
            }
          } else {
            return comment;
          }
        }
      );
      return {
        ...state,
        selectedPostComments: postCommentsUpdated,
      };
    },
    //@ts-ignore
    likeComment(state, action) {
      const { commentId, userId } = action.payload;
      let updatedComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: [...comment.likes, userId],
            };
          } else {
            return comment;
          }
        }
      );

      return {
        ...state,
        selectedPostComments: updatedComments,
      };
    },
    //@ts-ignore
    likeReply(state, action) {
      const { commentId, userId, replyId } = action.payload;
      const updatedComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replys: comment.replys.map((reply: CommentType) => {
                if (reply.id === replyId) {
                  return {
                    ...reply,
                    likes: [...reply.likes, userId],
                  };
                } else {
                  return reply;
                }
              }),
            };
          } else {
            return comment;
          }
        }
      );

      return {
        ...state,
        selectedPostComments: updatedComments,
      };
    },
    dislikeComment(state, action) {
      const { commentId, userId } = action.payload;
      //@ts-ignore
      state.selectedPostComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.likes.filter((uId) => uId !== userId),
            };
          } else {
            return comment;
          }
        }
      );
    },
    dislikeReply(state, action) {
      const { commentId, userId, replyId } = action.payload;
      //@ts-ignore
      state.selectedPostComments = state.selectedPostComments.map(
        (comment: CommentType) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replys: comment.replys.map((reply: CommentType) => {
                if (reply.id === replyId) {
                  return {
                    ...reply,
                    likes: reply.likes.filter((uId) => uId !== userId),
                  };
                } else {
                  return reply;
                }
              }),
            };
          } else {
            return comment;
          }
        }
      );
    },
    //@ts-ignore
    likeReel(state, action) {
      const { reelId, userId } = action.payload;
      let updatedReels = state.reels.map((reel: ReelType) => {
        if (reel.id === reelId) {
          return {
            ...reel,
            likes: [...reel.likes, userId],
          };
        } else {
          return reel;
        }
      });
      return {
        ...state,
        reels: updatedReels,
      };
    },
    dislikeReel(state, action) {
      const { reelId, userId } = action.payload;
      //@ts-ignore
      state.reels = state.reels.map((reel: ReelType) => {
        if (reel.id === reelId) {
          return {
            ...reel,
            likes: reel.likes.filter((uId) => uId !== userId),
          };
        } else {
          return reel;
        }
      });
    },
    deleteComment(state, action) {
      const { commentId, isReply, replyId } = action.payload;
     
      // const updatedComments = state.selectedPostComments.map((comment:CommentType) => {
      //   if (isReply && comment.id === commentId) {
      //     // If it's a reply and the comment matches the id, create a new comment
      //     return {
      //       ...comment,
      //       replys: comment.replys.filter(reply => reply.id !== replyId),
      //     };
      //   } else if (!isReply && comment.id === commentId) {
      //     // If it's not a reply and the comment matches the id, exclude it
      //     return null;
      //   } else {
      //     // Otherwise, keep the comment as is
      //     return comment;
      //   }
      // }).filter(Boolean); // Filter out null entries
    
      // //@ts-ignore
      // state.selectedPostComments = updatedComments;

       if(!isReply){
       state.selectedPostComments =  state.selectedPostComments.filter((comment:CommentType)=> comment.id !== commentId)
       }else if(isReply){
        //@ts-ignore
        state.selectedPostComments = state.selectedPostComments.map((comment:CommentType)=> {
          if(comment.id === commentId){
            return {
               ...comment,
               totalReplys:comment.totalReplys - 1,
               replys:comment.replys.filter((reply)=> reply.id !== replyId)
            }
          }else{
            return comment
          }
        })
       }

    }


  },
});

export const {
  addLoadedPosts,
  addLoadedReels,
  addLoadedComments,
  dislikeReel,
  likeReel,
  setReels,
  dislikeReply,
  dislikeComment,
  likeReply,
  likeComment,
  addTempComment,
  addTemperoryReply,
  addNewReply,
  setLoadedReplys,
  addLoadedReplys,
  addNewPost,
  removeLikeFromFeedPost,
  addLikeFromFeedPost,
  removeLike,
  addLike,
  setComments,
  addComment,
  handleSelectedPost,
  handleOpenCreatePost,
  handleViewPost,
  setFeedPosts,
  handleViewStory,
  handleSharePost,
  deleteComment,
} = postSlice.actions;
export default postSlice.reducer;
