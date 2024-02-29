import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
const ViewPost = dynamic(()=> import(`@/layouts/ViewPost`),{ssr:false})

interface IsViewPostRequiredProps {
  
}

const IsViewPostRequired: FC<IsViewPostRequiredProps> = ({}) => {
    const openViewPost = useSelector((state:RootState)=> state.post.viewPost)
  return (<>{openViewPost && <ViewPost/> }</>)
}

export default IsViewPostRequired