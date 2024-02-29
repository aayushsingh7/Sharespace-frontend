import { FC } from 'react'

interface LoadingPostProps {

}

const LoadingPost: FC<LoadingPostProps> = ({ }) => {
    return (
        <div className="w-100 m-t-10">

            <div className="main-bg-color w-100 flex ai-center jc-sb" style={{height:"60px"}}>
                <div className="flex ai-center jc-center p-10">
                    <p className="loading-template" style={{padding:"0px",height:"40px",width:"40px",borderRadius:"50%",marginRight:"15px"}}></p>

                    <div className="flex ai-start jc-start f-d-c">
                        <h4 className="loading-template" style={{width:"80px",padding:"7px"}}></h4>
                        <p className="loading-template" style={{width:"130px",padding:"5px",marginTop:"8px"}}></p>
                    </div>

                </div>


            </div>
            <div className={`loading-template of-hidden w-100`} style={{height:"590px"}}>
               
            </div>

            <div className="w-100 main-bg-color" style={{padding:"10px 10px"}}>
                <div className="w-100 flex ai-start jc-sb">
                   


                </div>
                <h4 className="loading-template"></h4>

                <div>
                  <p className="loading-template" style={{width:"70%",padding:"6px",lineHeight:"1.5rem"}}></p>
                  <p className="loading-template" style={{width:"30%",padding:"6px",marginTop:"10px",lineHeight:"1.5rem"}}></p>
                  <p className="loading-template" style={{width:"90%",padding:"6px",marginTop:"10px",lineHeight:"1.5rem"}}></p>
                  <p className="loading-template" style={{width:"60%",padding:"6px",marginTop:"10px",lineHeight:"1.5rem"}}></p>
                </div>

                <p className="loading-template" style={{width:"20%",padding:"6px",marginTop:"15px"}}></p>

            </div>

        </div>
    )
}

export default LoadingPost