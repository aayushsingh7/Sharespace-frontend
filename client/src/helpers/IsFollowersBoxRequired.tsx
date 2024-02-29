import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
const Followers = dynamic(()=> import('@/layouts/Followers'),{ssr:false})

interface IsFollowersBoxRequiredProps {
  
}

const IsFollowersBoxRequired: FC<IsFollowersBoxRequiredProps> = ({}) => {
    const openFollowerBox = useSelector((state:RootState)=> state.more.showFollowersBox)
  return (
   <>
   {
    openFollowerBox && <Followers/> 
   }
   </>
  )
}

export default IsFollowersBoxRequired