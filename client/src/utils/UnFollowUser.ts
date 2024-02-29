import {
  FOLLOWERS,
  FOLLOWING,
  GET_USER,
  LOGGED_IN_USER,
} from "@/graphQl/queries";
import { decreaseSelectedUserFollowers } from "@/slice/selectedUserSlice";
import { decreaseLoggedInUserFollowing } from "@/slice/userSlice";
import { UserType } from "@/types/types";
import { Dispatch } from "@reduxjs/toolkit";

export const unFollowUserFunction = async (
  manuallyRemoved: boolean,
  token: string,
  dispatch: Dispatch,
  loggedInUser: UserType,
  selectedUser: UserType,
  unFollowUserMutation: any
) => {
  try {
    if (!manuallyRemoved) {
      dispatch(decreaseSelectedUserFollowers(loggedInUser.id));
    } else {
      dispatch(decreaseSelectedUserFollowers(selectedUser.id));
    }
    
    const userId = !manuallyRemoved ? loggedInUser.id : selectedUser.id;

    const response = await unFollowUserMutation({
      variables: {
        reqSendingUser: !manuallyRemoved ? loggedInUser?.id : selectedUser?.id,
        reqReceivingUser: !manuallyRemoved
          ? selectedUser?.id
          : loggedInUser?.id,
      },
      // @ts-ignore
      update(cache, { data }) {

        const { loggedInUser } = cache.readQuery({
          query: LOGGED_IN_USER,
          variables: {
            cookie: token,
          },
        });

        cache.writeQuery({
          query: LOGGED_IN_USER,
          variables: {
            cookie: token,
          },
          data: {
            loggedInUser: {
              ...loggedInUser,
              following: loggedInUser.following.filter(
                (u: any) => u !== selectedUser.id
              ),
            },
          },
        });

        

      },
    });
  } catch (err) {
    console.log(err);
  }
};
