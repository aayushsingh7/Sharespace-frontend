
import User from "@/models/user";
import { PostType } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
    user:User,
    savedPosts:[],
    followSuggestions:[],
    isVerifying:true,
}

const userSlice = createSlice({
    name:"userSlice",
    initialState,
   reducers:{
      setUserData(state,action){
        state.user = action.payload
      },
      increaseLoggedInUserFollowing(state,action){
        state.user.following.push(action.payload?.id)
      },
      increaseLoggedInUserFollowers(state,action){
        state.user.followers.push(action.payload?.id)
      },
      decreaseLoggedInUserFollowing(state,action){
        state.user.following = state.user.following.filter((userId)=> userId !== action.payload)
      },
      decreaseLoggedInUserFollowers(state,action){
        state.user.followers = state.user.followers.filter((userId)=> userId !== action.payload)
      },
      savePost(state,action){
        //@ts-ignore
        state.savedPosts.push(action.payload)
        if(action.payload.dataType === "post"){
          state.user.savedPosts.push(action.payload.id)
        }else{
          state.user.savedReels.push(action.payload.id)
        }
        
      },
      unSavePost(state,action){
       state.savedPosts = state.savedPosts.filter((post:PostType)=> post.id !== action.payload.id)
       if(action.payload.dataType === "post"){
        state.user.savedPosts = state.user.savedPosts.filter((uId)=> uId !== action.payload.id)
       }else{
        state.user.savedReels = state.user.savedReels.filter((uId)=> uId !== action.payload.id)
       }
      },
      setSavePost(state,action){
        state.savedPosts = action.payload
      },
      addLoadedSavedPosts(state,action){
        //@ts-ignore
      state.savedPosts = [...state.savedPosts,...action.payload]
      },
      followSuggestions(state,action){
        state.followSuggestions = action.payload
      },
      handleVerification(state,action){
        state.isVerifying =action.payload
      }
   }
})

export const {addLoadedSavedPosts,handleVerification,followSuggestions,setSavePost,savePost,unSavePost,decreaseLoggedInUserFollowers,decreaseLoggedInUserFollowing,setUserData,increaseLoggedInUserFollowing,increaseLoggedInUserFollowers} = userSlice.actions;
export default userSlice.reducer;