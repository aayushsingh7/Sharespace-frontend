import User from "./user"
import { PostType } from "@/types/types"

let Post:PostType = {
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
  objectFit:"cover",
  createdAt:"",
}

export default Post