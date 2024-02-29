import { FC } from 'react'


interface LoadingBoxProps {
 padding?:string;
}

const LoadingBox: FC<LoadingBoxProps> = ({padding }) => {
    return (
        <div className="flex ai-center jc-start w-100  c-pointer" style={{padding:padding ? padding : "10px"}}>

        <div className="profile-pic-mid of-hidden br-50 loading-template m-r-10">
        </div>

        <div className="flex ai-start jc-sb w-100">
            <div className="flex ai-start jc-start f-d-c primary-text-color">
                <p className="loading-template" style={{width: "100px",height:" 10px", padding: "8px"}}>{}</p>
                <span  className="loading-template" style={{width: "150px",height:"3px", padding: "5px",marginTop:"10px"}} >{}</span>
            </div>
           {/* {followBtn ?  <button>Follow</button> : null} */}
        </div>
    </div>
    )
}

export default LoadingBox