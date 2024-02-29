import { handleNotificationBar } from '@/slice/moreSlice';
import { RootState } from '@/store/store';
import { FC } from 'react';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';

interface PhoneTopNavbarProps {
  
}

const PhoneTopNavbar: FC<PhoneTopNavbarProps> = ({}) => {
  const dispatch = useDispatch()
  const openNotificationBar = useSelector((state:RootState)=> state.more.openNotificationBar)
  const unSeenNotifications = useSelector((state:RootState)=> state.more.unSeenNotification)
  return (
    <div className="w-100 ai-center jc-sb main-bg-color primary-text-color b-t-light phone-top-navbar-container">
     <p>ShareSpace</p>
     
     <div style={{position:"-moz-initial"}} onClick={()=> {dispatch(handleNotificationBar(!openNotificationBar))}}>
          <div style={{position:"relative",height:"100%",display:"flex"}}>
          {unSeenNotifications.length > 0 ? <span className="br-50 flex ai-center jc-center primary-text-color absolute  notification-heart">{unSeenNotifications.length}</span> : null}
            {openNotificationBar ? (
              <GoHeartFill
                style={{
                  color: "white",
                  fontSize: "31px",
                }}
              />
            ) : (
              <GoHeart
                style={{
                  color: "white",
                  fontSize: "31px",
                }}
              />
            )}
          </div>
          </div>


    </div>
  )
}

export default PhoneTopNavbar