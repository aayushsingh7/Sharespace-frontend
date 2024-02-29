import { GET_USER } from "@/graphQl/queries";
import { decreaseSelectedUserRequests } from "@/slice/selectedUserSlice";
import { UserType } from "@/types/types";
import { Dispatch } from "@reduxjs/toolkit";

const cancleFollowRequest = async (
  dispatch: Dispatch,
  cancleFollowRequestMutation: any,
  receiver: UserType,
  sender: UserType,
  socket:any,
) => {
  try {
    dispatch(decreaseSelectedUserRequests(sender.id)); 
   
    socket.emit("CANCLE_FOLLOW_REQUEST",receiver.id,sender.id,"follow_request")
   

    const response = await cancleFollowRequestMutation({
      variables: {
        receiverId: receiver.id,
        senderId: sender.id,
    },
    // @ts-ignore
      update(cache, { data }) {

       const {user} = cache.readQuery({
        query:GET_USER,
        variables: {
            username:receiver.username,
          },
       })


       cache.writeQuery({
        query:GET_USER,
        variables: {
            username:receiver.username,
          },
         data:{
            user:{
                ...user,
                requests:user.requests.filter((u:any)=> u === sender.id)
            }
         }
       })

      },
    });
  } catch (err) {
    console.log(err);
  }
};

export default cancleFollowRequest;
