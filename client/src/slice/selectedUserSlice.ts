import Post from "@/models/post";
import Reel from "@/models/reel";
import User from "@/models/user";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedUser: User,
    selectedUserChanged: {
        username: ""
    },
    selectedUserPosts: [],
    selectedUserReels: [],
    followers: [],
    following: [],
    refetchFollowers: false,
    refetchFollowing: false,
}

const selectedUserSlice = createSlice({
    name: "selectedUser",
    initialState,
    reducers: {
        handleSelectedUser(state, action) {
            state.selectedUser = action.payload
        },
        setSelectedUserDetails(state, action) {
            const { username, userId } = action.payload
            state.selectedUser.id = userId
            state.selectedUser.username = username;
            state.selectedUserChanged.username = username;
        },
        setSelectedUserPosts(state, action) {
            console.log("_____________________________________________")
            // @ts-ignore
            state.selectedUserPosts =  action.payload;
           if(action.payload.id !== undefined){
             state.selectedUser.posts.push(action.payload?.id )
           }
        },
        setSelectedUserReels(state, action) {
            // @ts-ignore
            state.selectedUserReels = action.payload
            if(action.payload.id !== undefined){
            state.selectedUser.reels.push(action.payload?.id)
            }
        },
        setFollowers(state, action) {
            state.followers = action.payload
        },
        setFollowing(state, action) {
            state.following = action.payload
        },
        increaseSelectedUserFollowers(state, action) {
            state.selectedUser.followers.push(action.payload?.id)
            state.refetchFollowers = true;
            // @ts-ignore
            state.followers.push(action.payload)
        },
        increaseSelectedUserFollowing(state, action) {
            state.selectedUser.following.push(action.payload?.id)
            state.refetchFollowing = true;
            // @ts-ignore
            state.following.push(action.payload)
        },
        decreaseSelectedUserFollowing(state, action) {

            state.selectedUser.following = state.selectedUser.following.filter((userId) => userId !== action.payload)
            // @ts-ignore
            state.following = state.following.filter((user) => user.id !== action.payload)
        },
        decreaseSelectedUserFollowers(state, action) {
            state.selectedUser.followers = state.selectedUser.followers.filter((userId) => userId !== action.payload)
            // @ts-ignore
            state.followers = state.followers.filter((user) => user.id !== action.payload)
        },
     
        setLoadedUserPosts(state,action){
            console.log("___________________________________________________________________")
            //@ts-ignore
            state.selectedUserPosts = [...state.selectedUserPosts,...action.payload]
            // state.selectedUserPosts = state.selectedUserPosts.concat(
            //     action.payload.filter((newPost:any) => {
            //       return !state.selectedUserPosts.find(
            //         (existingPost:any) => existingPost.id === newPost.id
            //       );
            //     })
            //   );
              

       },
      
       setLoadedUserReels(state,action){
                //@ts-ignore
                state.selectedUserReels = state.selectedUserReels.concat(
                    action.payload.filter((newReel:any) => {
                      return !state.selectedUserReels.find(
                        (existingReel:any) => existingReel.id === newReel.id
                      );
                    })
                  );                  
    },
    increaseSelectedUserRequests(state,action){
      state.selectedUser = {
        ...state.selectedUser,
        requests:[...state.selectedUser.requests,action.payload]
      }
    },
    decreaseSelectedUserRequests(state,action){
        state.selectedUser = {
            ...state.selectedUser,
            requests:state.selectedUser.requests.filter((u)=> u !== action.payload)
          }
    }
    }
})

export const {decreaseSelectedUserRequests,increaseSelectedUserRequests,setLoadedUserReels,setLoadedUserPosts,decreaseSelectedUserFollowers,decreaseSelectedUserFollowing, handleSelectedUser, increaseSelectedUserFollowing, increaseSelectedUserFollowers, setFollowing, setFollowers, setSelectedUserDetails, setSelectedUserPosts, setSelectedUserReels } = selectedUserSlice.actions
export default selectedUserSlice.reducer