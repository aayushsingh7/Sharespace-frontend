import { MessageType } from "@/types/types"
import User from "./user"
import Post from "./post"

const Message:MessageType = {
    id:"",
    user:User,
    reaction:"",
    deleted:false,
    text:"",
    reply:[],
    dataType:"",
    createdAt:"",
    postInfo:Post,
    seenBy:[],
    messageId:"",
   }

   export default Message