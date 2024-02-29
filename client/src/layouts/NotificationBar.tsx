import LoadingBox from '@/components/LoadingBox'
import { SEEN_NOTIFICATIONS } from '@/graphQl/mutations'
import { NOTIFICATIONS } from '@/graphQl/queries'
import { handleNotificationBar, handleNotificationSeen, setNotifications } from '@/slice/moreSlice'
import { RootState } from '@/store/store'
import styles from '@/styles/NotificationBar.module.css'
import { useMutation, useQuery } from '@apollo/client'
import dynamic from 'next/dynamic'
import { FC, useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { IoNotificationsCircle } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client'
const NotificationBox = dynamic(()=> import('@/components/NotificationBox'),{
  ssr:false
})

interface NotificationBarProps {
  
}

const NotificationBar: FC<NotificationBarProps> = ({}) => {
  const [socket,setSocket] = useState<any>()
    const openNotificationBar = useSelector((state:RootState)=> state.more.openNotificationBar)
    const loggedInUser = useSelector((state:RootState)=> state.user.user)
    const notifications = useSelector((state:RootState)=> state.more.notifications)
    const [notificationLoading,setNotificationLoading] = useState<boolean>(false)
    const [unSeenNotificationIds,setUnSeenNotificationIds] = useState<any[]>([])
    const [seenNotificationMutation] = useMutation(SEEN_NOTIFICATIONS)
    const dispatch = useDispatch()
    const {loading,data,error,refetch} = useQuery(NOTIFICATIONS,{
      variables:{
        userId:loggedInUser.id
      },skip:!openNotificationBar
    })

    useEffect(()=> {
      if(!loading) return;
      setNotificationLoading(true)
     const getNotifications = async()=> {
      try {
        await refetch().then(({data})=> {
          if(data?.notifications){
            dispatch(setNotifications(data?.notifications))
            setNotificationLoading(false)
          }
        })
      } catch (err) {}
     }
     getNotifications()
    },[openNotificationBar])

    useEffect(() => {
      const s = io("https://api-sharesapce-backend.onrender.com/");
  
      setSocket(s);
      return () => {
        s.disconnect();
      };
    }, []);

    useEffect(()=> {
 if(unSeenNotificationIds.length > 0 && openNotificationBar ){
    const seenNotification = async()=> {
      await seenNotificationMutation({
        variables:{
          notificationIds:unSeenNotificationIds,
          userId:loggedInUser.id
        }
      })
      dispatch(handleNotificationSeen({notificationIds:unSeenNotificationIds,userId:loggedInUser.id}))
      setUnSeenNotificationIds([])
    }
    seenNotification()
 }
    },[unSeenNotificationIds,openNotificationBar])

  
  return (
    <div
    className={`main-bg-color absolute h-100vh p-10 zi-10 b-right flex f-d-c ${styles.container} ${openNotificationBar ? styles.show : styles.hide}`}
  >
    <div className={`b-bottom flex jc-sb ai-center ${styles.search_header}`}>
      <h3 className='primary-text-color m-t-20' style={{fontSize:"1.6rem"}}>Notifications</h3>
      <AiOutlineClose onClick={()=> dispatch(handleNotificationBar(false))}/>
    </div>

    <div className={`flex ai-start jc-start f-d-c flex-1 of-y-scroll of-x-hidden flex w-100 ${styles.notification_container}`} style={{padding:"20px 0px"}}>
    {
    notificationLoading  ? 
    <>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    <LoadingBox/>
    </> : !notificationLoading && notifications.length <= 0 ?
     <div className={`flex ai-center jc-center f-d-c w-100 flex-1 ${styles.template}`}>
     <IoNotificationsCircle/>
     <p className='primary-text-color fs-normal' style={{marginTop:"30px"}}>No Notifications Yet.</p>
     <button className='btn dark-mid-bg-color primary-text-color m-t-15 c-pointer br-10 ' onClick={()=> dispatch(handleNotificationBar(false))}>Close</button>
   </div>
      : openNotificationBar && notifications.map((notification:any)=> {
        return <NotificationBox key={notification.id} data={notification} socket={socket} setUnSeenNotificationIds={setUnSeenNotificationIds}/>
      })
    }
    </div>

  </div>
  )
}

export default NotificationBar