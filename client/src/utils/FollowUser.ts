import {
  FOLLOWERS,
  FOLLOWING,
  GET_USER,
  LOGGED_IN_USER,
} from "@/graphQl/queries";
import {
  increaseSelectedUserFollowers,
  increaseSelectedUserRequests,
} from "@/slice/selectedUserSlice";
import { increaseLoggedInUserFollowing } from "@/slice/userSlice";
import { UserType } from "@/types/types";
import { Dispatch } from "@reduxjs/toolkit";

export const followUserFunction = async (
  token: string,
  dispatch: Dispatch,
  loggedInUser: UserType,
  selectedUser: UserType,
  followUserMutation: any,
  socket?:any,
) => {
  try {
   

    if (selectedUser.accountType === "private") {
      dispatch(increaseSelectedUserRequests(loggedInUser.id));
    } else {
      dispatch(increaseSelectedUserFollowers(loggedInUser));
      dispatch(increaseLoggedInUserFollowing(selectedUser));
    }

    const response = await followUserMutation({
      variables: {
        reqSendingUser: loggedInUser?.id,
        reqReceivingUser: selectedUser?.id,
      },
      // @ts-ignore
      update(cache, { data }) {

        socket.emit("NEW_NOTIFICATION_RECEIVED",data?.followUser)

        // @ts-ignore
        const { user } = cache.readQuery({
          query: GET_USER,
          variables: {
            username: selectedUser?.username,
          },
        });

        if (selectedUser.accountType === "private") {
          cache.writeQuery({
            query: GET_USER,
            variables: {
              username: selectedUser.username,
            },
            data: {
              user: {
                ...user,
                requests: [...user.requests, loggedInUser.id],
              },
            },
          });
        } else {

          const { loggedInUser } = cache.readQuery({
            query: LOGGED_IN_USER,
            variables: {
              cookie: token,
            },
          });

          const { following } = cache.readQuery({
            query: FOLLOWING,
            variables: {
              userId: loggedInUser.id,
            },
          });

          cache.writeQuery({
            query: GET_USER,
            variables: {
              username: selectedUser.username,
            },
            data: {
              user: {
                ...user,
                followers: [...user.followers, loggedInUser.id],
              },
            },
          });



          const newFollowing = {
            username: selectedUser.username,
            id: selectedUser.id,
            profilePic: selectedUser.profilePic,
            name: selectedUser.name,
          };

          cache.writeQuery({
            query: LOGGED_IN_USER,
            variables: {
              cookie: token,
            },
            data: {
              loggedInUser: {
                ...loggedInUser,
                following: [...loggedInUser.following, selectedUser.id],
              },
            },
          });

          cache.writeQuery({
            query: FOLLOWING,
            variables: {
              userId: loggedInUser.id,
            },
            data: {
              following: [newFollowing, ...following],
            },
          });
        }
      },
    });
  } catch (err) {
    console.log(err);
  }
};
