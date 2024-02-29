const CreatePost = dynamic(()=> import("@/layouts/CreatePost"),{ssr:false})
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'

interface IsCreatePostRequiredProps {
  
}

const IsCreatePostRequired: FC<IsCreatePostRequiredProps> = ({}) => {
    const openCreatePost = useSelector((state:RootState)=> state.post.openCreatePost)
  return (<>{openCreatePost && <CreatePost/>}</>)
}

export default IsCreatePostRequired