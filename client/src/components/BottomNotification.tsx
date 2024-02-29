import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface BottomNotificationProps {
  
}

const BottomNotification: FC<BottomNotificationProps> = ({}) => {

    const NotificationText = useSelector((state:RootState)=> state.more.notificationText)
    const showNotification = useSelector((state:RootState)=> state.more.bottomNotification)

  return (
    <div className={`w-100vw fixed dark-bg-color flex ai-center jc-center zi-10000 left-0 bottom-0-not primary-text-color h-60px t-0-3s fs-normal ${showNotification ? "show-bottom-0" : "hide-bottom-100"}` }>
        <p>{NotificationText}</p>
    </div>
  )
}

export default BottomNotification