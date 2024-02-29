const NotificationBar = dynamic(()=> import('@/layouts/NotificationBar'),{ssr:false})
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'


interface IsNotificationBarRequiredProps {
  
}

const IsNotificationBarRequired: FC<IsNotificationBarRequiredProps> = ({}) => {
    const openNotificationBar = useSelector((state:RootState)=> state.more.openNotificationBar)
  return (<>{openNotificationBar && <NotificationBar/>}</>)
}

export default IsNotificationBarRequired