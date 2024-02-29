import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSelector } from 'react-redux'
const DeletePost = dynamic(()=> import("@/layouts/DeletePost"),{
    ssr:false,
})

interface IsDeletePostConfirmationRequiredProps {
  
}

const IsDeletePostConfirmationRequired: FC<IsDeletePostConfirmationRequiredProps> = ({}) => {
    const deleteConfirmation = useSelector((state:RootState)=> state.more.deleteConfirmation)
  return (deleteConfirmation ? <DeletePost/> : null)
}

export default IsDeletePostConfirmationRequired