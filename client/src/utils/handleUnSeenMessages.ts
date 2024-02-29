import { UserType } from "@/types/types";

const messageSeenFunction = (data:any,setUnReadMessages:Function,loggedInUser:UserType) => {
    //  window.alert("teri ma ki chjutttttt teri ma kichuttt")
      if (data) {
        //@ts-ignore
        const unreadMsgIds = data.messages.reduce((accumulator, msg: any) => {
          // console.log('msg.seenBy',msg.messageId)
          if (
            //@ts-ignore
            !msg.seenBy.includes(loggedInUser.id) && !accumulator.includes(msg.messageId)
          ) {
            //@ts-ignore
            accumulator.push(msg.messageId);
          }
          return accumulator;
        }, [])
        console.log("ajdfaldjflakdjfjajfajdfjajdf;lakdfjkla;sd;kfjakdfkl;ajdfakdjf;a",unreadMsgIds)
        setUnReadMessages(unreadMsgIds);
      }
    };
    
export default messageSeenFunction;