import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleOpenSideNav, handleUserSearch } from "@/slice/navbarSlice";
import {
  handleFollowersBox,
  handleFollowingBox,
  handleViewProfile,
} from "@/slice/moreSlice";
import { UserType } from "@/types/types";
import { RootState } from "@/store/store";
import { unFollowUserFunction } from "@/utils/UnFollowUser";
import { useMutation } from "@apollo/client";
import { UNFOLLOW_USER } from "@/graphQl/mutations";
import Link from "next/link";
import { useRouter } from "next/router";

interface FollowingAndFollowersBoxProps {
  data: UserType;
}

const FollowingAndFollowersBox: FC<FollowingAndFollowersBoxProps> = ({
  data,
}) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.more.token);
  const [unFollowUserMutation] = useMutation(UNFOLLOW_USER);
  const following = useSelector((state:RootState)=> state.selectedUser.following)
  const followers = useSelector((state:RootState)=> state.selectedUser.followers)
  const router = useRouter()

  const handleClicks = (username: any, userId: any) => {
    dispatch(handleOpenSideNav(true));
    dispatch(handleUserSearch(false));
    dispatch(handleViewProfile(true));
    dispatch(handleFollowersBox(false));
    dispatch(handleFollowingBox(false));
  };

  const removeFollower = async (e: any) => {

    e.stopPropagation();
    e.preventDefault()

    unFollowUserFunction(
      following ? false : true ,
      token,
      dispatch,
      loggedInUser,
      data,
      unFollowUserMutation
    );
  };

  return (
    <Link href={`/profile/${data?.username}`} style={{ width: "100%", textDecoration: "none" }}>
    <div
      className="flex ai-center jc-start w-100 c-pointer"
      style={{padding:"10px 14px 10px 16px"}}
      onClick={() => handleClicks(data?.username, data?.id)}
    >
      <div className="f-a-f-box-profile-pic of-hidden br-50" style={{marginRight:"10px"}}>
        <img src={data?.profilePic} alt="" className="ofit-cover w-100" height={47} />
      </div>

      <div className="flex ai-center jc-sb w-100">
        <div className="flex ai-start jc-start f-d-c primary-text-color">
          <h4 style={{marginBottom:"0px"}} className="primary-color">{data?.username} </h4>
          {data?.name ? <p className="fs-small secondary-text-color" style={{marginTop:"4px"}}>{data?.name}</p> : null}
        </div>
      {loggedInUser.username === router.query.username  ?   <button onClick={removeFollower} className="btn c-pointer light-dark-bg-color primary-text-color  br-10" style={{padding:"9px 13px"}}>Remove</button> : null}
      </div>
    </div>
     </Link>
  );
};

export default FollowingAndFollowersBox;
