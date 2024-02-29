const EditPost = dynamic(()=> import('@/layouts/EditPost'),{ssr:false})
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'

interface IsEditPostRequiredProps {
  
}

const IsEditPostRequired: FC<IsEditPostRequiredProps> = ({}) => {
    const editPost = useSelector((state:RootState)=> state.more.openEditPost)
  return (<>{editPost && <EditPost/> }</>)
}

export default IsEditPostRequired