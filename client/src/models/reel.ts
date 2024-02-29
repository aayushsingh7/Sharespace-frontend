import User from "./user"
import { ReelType } from "@/types/types"

let Reel:ReelType = {
  id:"",
  dataType:"",
  likes:[],
  comments:[],
  shares:0,
  postedBy:User,
  description:"",
  uploadedData:[""],
  views:[""],
  reports:0,
  viewsAndLikesHide:false,
  commentsOff:false,
  createdAt:"",
}

export default Reel