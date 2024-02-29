import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import dynamic from 'next/dynamic'
const MoreOptions = dynamic(()=> import("@/layouts/MoreOptions"),{ssr:false})

interface IsMoreOptionsRequiredProps {
  
}

const IsMoreOptionsRequired: FC<IsMoreOptionsRequiredProps> = ({}) => {
    const openMoreOptions = useSelector((state:RootState)=> state.more.showMoreOptions)
  return (<>{openMoreOptions && <MoreOptions/> }</>)
}

export default IsMoreOptionsRequired