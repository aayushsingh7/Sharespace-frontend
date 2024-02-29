import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'
const SharePost = dynamic(()=> import('@/layouts/SharePost'),{ssr:false})


interface IsSharePostRequiredProps {
  
}

const IsSharePostRequired: FC<IsSharePostRequiredProps> = ({}) => {
    const openSharePost = useSelector((state:RootState)=> state.post.sharePost)
  return (<>{openSharePost && <SharePost/>}</>)
}

export default IsSharePostRequired