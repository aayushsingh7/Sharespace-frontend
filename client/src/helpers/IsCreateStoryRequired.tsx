const CreateStory = dynamic(()=> import("@/layouts/CreateStory"),{ssr:false})
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'

interface IsCreateStoryRequiredProps {
  
}

const IsCreateStoryRequired: FC<IsCreateStoryRequiredProps> = ({}) => {
    const openCreateStory = useSelector((state:RootState)=> state.more.openStoryBox)
  return (<>{openCreateStory && <CreateStory/> }</>)
}

export default IsCreateStoryRequired