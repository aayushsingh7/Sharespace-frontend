import FollowingAndFollowersBox from '@/components/FollowingAndFollowersBox'
import { FOLLOWING } from '@/graphQl/queries'
import { handleFollowingBox } from '@/slice/moreSlice'
import { setFollowing } from '@/slice/selectedUserSlice'
import { RootState } from '@/store/store'
import styles from '@/styles/FollowBox.module.css'
import { UserType } from '@/types/types'
import { useQuery } from '@apollo/client'
import { FC, useEffect } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { ClipLoader } from 'react-spinners'

interface FollowingProps {
}

const Following: FC<FollowingProps> = ({ }) => {

  const dispatch = useDispatch()
  const selectedUser = useSelector((state: RootState) => state.selectedUser.selectedUser)
  const following: UserType[] = useSelector((state: RootState) => state.selectedUser.following)
  const showFollowingBox = useSelector((state: RootState) => state.more.showFollowingBox)
 
  const { loading: followingLoading, data: followingData, error: followingError } = useQuery(FOLLOWING, {
    variables: { userId: selectedUser?.id },
    fetchPolicy:"network-only",
    skip:showFollowingBox === false
  });

  useEffect(() => {
    if (followingLoading) {
      return;
    }

     if(followingError){
      console.log(followingError)
     }else {
      if (followingData?.following) {
        dispatch(setFollowing(followingData.following));
      }
     }
  }, [followingData])

  

  return (
     <div
      className={`w-100vw h-100dvh fixed left-0 top-0 z-1000 ai-center jc-center show-overlay-container flex zi-1000`}
      >
       
        <div className={`dark-bg-color absolute br-10 of-hidden flex f-d-c ${styles.box}`}>
          <div className="flex ai-center jc-sb p-10 primary-text-color b-bottom-light w-100">
            <p></p>
            <h4>Following</h4>
            <AiOutlineClose
              style={{ fontSize: "24px", cursor: "pointer" }}
              onClick={() => dispatch(handleFollowingBox(false))}
            />
          </div>
    
          <div className={`flex ai-start jc-start of-y-scroll w-100 f-d-c flex-grow ${styles.users_container}`}>
            {followingLoading ? (
             <div className="w-100 flex ai-center jc-center" style={{height:"90%"}}>
              <ClipLoader
             color={"#f1f1f1"}
             loading={true}
             size={45}
             // cssOverride={override}
             aria-label="Loading Spinner"
             data-testid="loader"
           /></div>
            ) : followingData?.following?.length <= 0 && showFollowingBox ? (
              <p className="w-100 flex ai-center jc-center primary-text-color" style={{fontSize:"1.3rem",height:"90%"}}>0 following found</p>
            ) : (
              following?.map((user:UserType) => {
                return <FollowingAndFollowersBox key={user.id} data={user} />;
              })
            )}
          </div>
        </div>
      </div> 
  )
}

export default Following