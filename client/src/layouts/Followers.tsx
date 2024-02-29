import FollowingAndFollowersBox from "@/components/FollowingAndFollowersBox";
import { FOLLOWERS } from "@/graphQl/queries";
import { handleFollowersBox } from "@/slice/moreSlice";
import { setFollowers } from "@/slice/selectedUserSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/FollowBox.module.css";
import { UserType } from "@/types/types";
import { useQuery } from "@apollo/client";
import { FC, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

interface FollowersProps {}

const Followers: FC<FollowersProps> = ({}) => {
  const dispatch = useDispatch();
  const selectedUser = useSelector(
    (state: RootState) => state.selectedUser.selectedUser
  );
  const followers: UserType[] = useSelector(
    (state: RootState) => state.selectedUser.followers
  );
  const showFollowersBox = useSelector(
    (state: RootState) => state.more.showFollowersBox
  );

  const {
    loading: followersLoading,
    data: followersData,
    error: followersError,
    refetch,
  } = useQuery(FOLLOWERS, {
    variables: { userId: selectedUser?.id },
    fetchPolicy:"network-only",
    skip: showFollowersBox === false,
  });

  useEffect(() => {
    const getFollowers = async () => {
      console.log(showFollowersBox);
      if (!showFollowersBox) return;
      if (followersError) {
        console.log(followersError);
      }

      await refetch().then(({ data }) => {
        if (data?.followers) {
          dispatch(setFollowers(data?.followers));
        }
      });
    };
    getFollowers();
  }, [showFollowersBox]);

  return (
  <div
  className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
  >
    <div className={`dark-bg-color absolute br-10 of-hidden flex f-d-c ${styles.box}`}>
      <div className="flex ai-center jc-sb p-10 primary-text-color b-bottom-light w-100">
        <p></p>
        <h4>Followers</h4>
        <AiOutlineClose
          style={{ fontSize: "24px", cursor: "pointer" }}
          onClick={() => dispatch(handleFollowersBox(false))}
        />
      </div>

      <div className={`flex ai-start jc-start of-y-scroll w-100 f-d-c flex-grow ${styles.users_container}`}>
        {followersLoading ? (
         <div className="w-100 flex ai-center jc-center" style={{height:"90%"}}>
          <ClipLoader
         color={"#f1f1f1"}
         loading={true}
         size={45}
         aria-label="Loading Spinner"
         data-testid="loader"
       /></div>
        ) : followersData?.followers?.length == 0 && showFollowersBox ? (
          <p className="w-100 flex ai-center jc-center primary-text-color" style={{fontSize:"1.3rem",height:"90%"}}>0 followers found</p>
        ) : (
          followers?.map((user:UserType) => {
            return <FollowingAndFollowersBox key={user.id} data={user} />;
          })
        )}
      </div>
    </div>
  </div> 
  );
};

export default Followers;
