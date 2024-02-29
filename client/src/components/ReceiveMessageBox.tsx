import { handleSelectedPost, handleViewPost } from '@/slice/postSlice'
import { MessageType } from '@/types/types'
import Image from 'next/image'
import { FC, useEffect, useRef, useState } from 'react'
import { BiSolidMoviePlay } from 'react-icons/bi'
import { FaPlay } from 'react-icons/fa'
import ReactPlayer from 'react-player'
import { useDispatch } from 'react-redux'

interface ReceiveMessageBoxProps {
    data: MessageType
}

const ReceiveMessageBox: FC<ReceiveMessageBoxProps> = ({data}) => {

    const dispatch = useDispatch()
    const [playReel, setPlayReel] = useState<boolean>(false)
    const videoRef = useRef(null)
  
    useEffect(() => {
      if (videoRef.current && !playReel) {
        //@ts-ignore
        videoRef.current.seekTo(0);
      }
    }, [playReel]);

    // console.log({
    //   type:data?.dataType,
    //   text:data?.text,
    //   upload_data:data?.postInfo?.uploadedData[0]
    // })


  return (
    <div className="w-100 flex ai-center jc-start ladfjaf" style={{margin:"3px"}}>
      {
        data?.dataType === "post" ?
          <div className="flex ai-start jc-start f-d-c of-hidden c-pointer" style={{borderRadius:"15px",maxWidth:"300px"}} onClick={() => { dispatch(handleViewPost(true)); dispatch(handleSelectedPost(data.postInfo)) }}>
            <div className="flex ai-center jc-start dark-bg-color primary-text-color w-100 relative zi-10" style={{padding:"12px 16px"}}> 
              <Image src={`${data?.postInfo?.postedBy.profilePic}`} alt="" width={35} height={35} style={{marginRight:"12px"}} className='br-50 ofit-50'/>
              <p className='fs-m-small'>{data.postInfo?.postedBy.username}</p>
            </div>
            <div className="relative kjjfe" style={{width:"300px",height:"350px"}} onMouseEnter={()=> setPlayReel(true)} onMouseLeave={()=> setPlayReel(false)}>
              {
                data?.postInfo?.uploadedData[0].includes(".mp4") ? 

                <>
                <ReactPlayer
                  url={`${data?.postInfo?.uploadedData[0]}`}
                  width='100%'
                  height='100%'
                  loop={true}
                  playing={playReel ? true : false}
                  muted={true}
                  ref={videoRef}
                style={{objectFit:"cover"}}
                
                />
                <FaPlay className='absolute primary-text-color zi-10'/>
                </>

                :
                <Image src={`${data?.postInfo?.uploadedData[0]}`} alt="" fill={true} loading='lazy' objectFit='cover' />
              }

            </div>
           {
            data?.postInfo?.description ? 
            <div className="w-100 dark-bg-color primary-text-color fs-small" style={{padding:"16px"}}>
            <p className='wk-bo' style={{WebkitLineClamp:"2"}}>{data.postInfo?.description}</p>
          </div> : null
           }
          </div> :
          data?.dataType === "reel" ?
            <div className="relative br-10 of-hidden flex c-pointer" style={{maxWidth:"220px",height:"380px"}} onClick={() => { dispatch(handleViewPost(true)); dispatch(handleSelectedPost(data.postInfo)) }} >
              <div className="flex ai-center jc-start p-10 w-100 absolute top-0 left-0 bg-none zi-10">
                <Image src={`${data?.postInfo?.postedBy.profilePic}`} alt="" width={35} height={35} loading='lazy' style={{marginRight:"12px"}}  className='ofit-50 br-50'/>
                <p className='primary-text-color fw-600'>{data.postInfo?.postedBy.username}</p>
              </div>
              <div className="relative" onMouseEnter={() => setPlayReel(true)} onMouseOut={() => setPlayReel(false)}>
                <ReactPlayer
                  url={`${data?.postInfo?.uploadedData[0]}`}
                  width='100%'
                  height='100%'
                  loop={true}
                  playing={playReel ? true : false}
                  muted={true}
                  ref={videoRef}
                />
                <BiSolidMoviePlay style={{ fontSize: "30px" }} className='primary-text-color absolute wieioi' />
              </div>
            </div>
            :
            <p className="dark-bg-color br-10 primary-text-color fs-m-small" style={{padding:"13px",borderTopLeftRadius:"0px"}}>{data.text}</p>
      }
    </div>
  )
}

export default ReceiveMessageBox