import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
const Following = dynamic(()=> import('@/layouts/Following'),{ssr:false})

interface IsFollowingBoxRequiredProps {
  
}

const IsFollowingBoxRequired: FC<IsFollowingBoxRequiredProps> = ({}) => {
    const openFollowingBox = useSelector((state:RootState)=> state.more.showFollowingBox)
  return (<>{openFollowingBox && <Following/> }</>)
}

export default IsFollowingBoxRequired