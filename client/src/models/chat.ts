import { ChatType } from "@/types/types"
import User from "./user"
import Message from "./message"

const Chat:ChatType = {
    id:"",
    isGroupChat:false,
    name:"",
    users:[],
    deletedFor:[],
    messages:[],
    latestMessage:Message,
    admins:[],
    createdBy:User,
    picture:"",
    createdAt:"",
    updatedAt:""
}

export default Chat