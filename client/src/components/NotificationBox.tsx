import {
  ACCEPT_FOLLOW_REQUEST,
  CANCLE_FOLLOW_REQUEST,
} from "@/graphQl/mutations";
import { handleSelectedPost, handleViewPost } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import cancleFollowRequest from "@/utils/cancleFollowRequest";
import convertMessageCreatedAt from "@/utils/convertMessageCreatedAt";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

interface NotificationBoxProps {
  data: any;
  socket: any;
  setUnSeenNotificationIds:Function;
}

const NotificationBox: FC<NotificationBoxProps> = ({ data, socket, setUnSeenNotificationIds }) => {
  const [acceptFollowRequestMutation] = useMutation(ACCEPT_FOLLOW_REQUEST);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [cancleFollowRequestMutation] = useMutation(CANCLE_FOLLOW_REQUEST);
  const openNotificationBar = useSelector((state:RootState)=> state.more.openNotificationBar)

  const acceptFollowRequest = async () => {
    try {
      setLoading(true);
      const response = await acceptFollowRequestMutation({
        variables: {
          receiver: data.receiver,
          sender: data.sender.id,
          notificationId: data.id,
        },
      });
      const d = await response.data;
      socket.emit("NEW_NOTIFICATION_RECEIVED", d?.acceptFollowRequest);
      setLoading(false);
    } catch (err) {
     bottomNotification(dispatch,"Cannot accept request now")
    }
  };

  useEffect(()=> {
    if(!data?.seenBy?.includes(loggedInUser.id)){
         setUnSeenNotificationIds((ids:any)=> {
          return [...ids,data.id]
         })
    }else{
      setUnSeenNotificationIds((ids:string[])=> {
        return ids.filter((id:string)=> id !== loggedInUser.id)
      })
    }
  },[openNotificationBar])
 
  console.log(data)

  return (
    <div className="flex ai-center jc-start w-100 p-10 c-pointer br-10 h-l" onClick={() => { dispatch(handleViewPost(true)); dispatch(handleSelectedPost(data.reel || data.post)) }}>
      <div className="f-a-f-box-profile-pic of-hidden br-50 m-r-10">
        <img src={data.sender.profilePic} alt="" className="w-100 ofit-cover" height={47} />
      </div>

      <div className="flex ai-center jc-sb w-100">
        <div className={`primary-text-color l-h-20 ${data?.notificationType === "new_follower" ? "w-100" : "w-80"}`}>
          <span className="primary-text-color fw-600" style={{marginBottom:"0px"}}>{data.sender.username} </span>
          {data?.text ? `${data.subject}` : `${data.subject}.`}{" "}
          {data.text ? `${data.text}.` : null}{" "}
          {
            //@ts-ignore
          <span className="secondary-text-color">{convertMessageCreatedAt(parseInt(data.updatedAt))}</span>
          }
        </div>

        {data.notificationType == "commented" ||
        data.notificationType == "replied" ||
        data.notificationType == "liked" ? (
          data?.reel || data?.post.uploadedData[0]?.includes(".mp4") ? (
            <ReactPlayer
              url={data?.reel?.uploadedData[0] || data?.post?.uploadedData[0]}
              loop={true}
              width={45}
              height={45}
              controls={false}
              style={{objectFit:"cover"}}
            />
          ) : (
            <Image
              src={
                data.post
                  ? data?.post.uploadedData[0]
                  : data?.reel.uploadedData[0]
              }
              alt=""
              className="ofit-cover"
              height={45}
              width={45}
            />
          )
        ) : data?.notificationType === "new_follower" ? null : (
          <div className="flex ai-center jc-center notifcation-box-btn-con">
            {loading ? (
              <button>Please wait...</button>
            ) : (
              <>
                {" "}
                <button onClick={acceptFollowRequest} className="primary-text-color highlight-bg-color br-10 m-l-10 c-pointer fw-600">Confirm</button>
                <button
                  className="primary-text-color light-dark-bg-color br-10 m-l-10 c-pointer fw-600"
                  onClick={() =>
                    cancleFollowRequest(
                      dispatch,
                      cancleFollowRequestMutation,
                      loggedInUser,
                      data?.sender,
                      socket
                    )
                  }
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBox;
