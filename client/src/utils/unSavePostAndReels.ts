import { LOGGED_IN_USER, SAVED_POSTS } from "@/graphQl/queries"
import { PostType, ReelType, UserType } from "@/types/types"
import bottomNotification from "./handleBottomNotification";

const unSavePostAndReels = async(unSavePostAndReelsMutation:any,data:PostType|ReelType,loggedInUser:UserType,token:String,dispatch:any,unSavePost:any)=> {
    try {
        let updatedLoggedInUser;
        dispatch(unSavePost(data))
        bottomNotification(dispatch,"Unsaved")
        const userId = loggedInUser.id
        const response =  await unSavePostAndReelsMutation({variables:{
            id:data?.id,
            dataType:data?.dataType,
            userId:loggedInUser.id
            //@ts-ignore
        },update(cache,{}) {
            //@ts-ignore
           const {loggedInUser} = cache.readQuery({
            query:LOGGED_IN_USER,
            variables:{
               cookie:token
            }
           })

           const {savedPostAndReels} = cache.readQuery({
            query: SAVED_POSTS,
            variables: {
              userId: loggedInUser?.id,
              skip: 0,
            },
          });


           if(data.dataType === "post"){
            updatedLoggedInUser = {
                ...loggedInUser,
                savedPosts:loggedInUser.savedPosts.filter((postId:string)=> postId !== data?.id)
            }
           }else{
            updatedLoggedInUser = {
                ...loggedInUser,
                savedPosts:loggedInUser.savedReels.filter((postId:string)=> postId !== data?.id)
            }
           }

           cache.writeQuery({
            query:LOGGED_IN_USER,
            variables:{
                cookie:token,
            },
            data:{
                loggedInUser:updatedLoggedInUser
            }
           })


           cache.writeQuery({
            query: SAVED_POSTS,
            variables: {
              userId: loggedInUser?.id,
              skip: 0,
            },
            data: {
              //@ts-ignore
              savedPostAndReels:savedPostAndReels.filter((p)=> p.id !== data?.id)
            },
          });


        }})
    } catch (err) {
        console.log(err)
    }
}

export default unSavePostAndReels