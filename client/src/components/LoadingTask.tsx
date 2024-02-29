import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface LoadingTaskProps {
  
}

const LoadingTask: FC<LoadingTaskProps> = ({}) => {
    const loadingTask = useSelector((state:RootState)=> state.more.loadingTask)
  return (
    <div className={`loading-indicator-bar h-100 fixed w-100 top-0 zi-10000 ${loadingTask ? "show-indicator" : ""}`}></div>
  )
}

export default LoadingTask