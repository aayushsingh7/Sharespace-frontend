import { CHAT_AVAILABLE } from "@/graphQl/queries";
import { RootState } from "@/store/store";
import { ChatType, UserType } from "@/types/types";
import { chatInfo } from "@/utils/chatInfo";
import { useQuery } from "@apollo/client";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { MdDone } from "react-icons/md";
import { useSelector } from "react-redux";

type SelectedUser = {
  username: string;
  id: string;
};

interface SuggestionUserBoxProps {
  dataType: string;
  data: ChatType | UserType;
  setSelectedUsers: any;
  selectedUsers: SelectedUser[];
  setSelectedChats: any;
  handleLoading:any;
}

const SuggestionUserBox: FC<SuggestionUserBoxProps> = ({
  setSelectedChats,
  data,
  dataType,
  setSelectedUsers,
  selectedUsers,
  handleLoading
}) => {
  const [toggle, setToggle] = useState(false);
  const loggedInUser: UserType = useSelector(
    (state: RootState) => state.user.user
  );
  //@ts-ignore
  const user = dataType === "user"? data?.id : chatInfo(data?.users, loggedInUser, data)?.tempId;

  const {
    loading: chatLoading,
    data: chatData,
    error: chatError,
    refetch: chatRefetch,
  } = useQuery(CHAT_AVAILABLE, {
    variables: {
      users: [user, loggedInUser.id],
      loggedInUser: loggedInUser.id,
      isGroupChat: false,
    },
  });


  useEffect(() => {
    if (chatLoading) return;
    if (chatError) return console.error(chatError);
  }, [chatData]);


  const addChatToSelectedChat = async (selected:ChatType|UserType) => {
    try {

     if(toggle){

      setSelectedChats((old:any)=> {
          return old.filter((chat:any)=> chat.id !== selected.id)
        })

     }else{
         handleLoading(true)
      await chatRefetch().then(({ data }) => {
        setSelectedChats((old: any) => {
          return [...old, data?.chatAvailable];
        })
        handleLoading(false)
      })

     }
    } catch (err) {
      console.log(err);
    }
  };



  const addNewSelectedUser = (selected: any) => {
    if (dataType === "user") {
      if (selectedUsers.length >= 5) {
        return window.alert("U can only share 5 people at a time");
      }
      if (toggle) {

        setSelectedUsers((old: any) => {
          return selectedUsers.filter((user) => user.id !== selected.id);
        });

      } else {
        setSelectedUsers((old: any) => {
          return [
            ...old,
            {
              id: data?.id,
              //@ts-ignore
              username: data?.username,
            },
          ];
        });
      }
    } else {
      if (selectedUsers.length >= 5) {
        return window.alert("U can only share 5 people at a time");
      }
      //@ts-ignore
      let d = chatInfo(data?.users, loggedInUser, data);
      if (toggle) {
        setSelectedUsers((old: any) => {
          return selectedUsers.filter((user) => user.id !== selected.id);
        });
      } else {
        setSelectedUsers((old: any) => {
          return [
            ...old,
            {
              id: d.id,
              username: d.name,
            },
          ];
        });
      }
    }
  };


  return (
    <div
      key={data.id}
      className="flex ai-center jc-start w-100 c-pointer" style={{padding:"10px 17px"}}
      onClick={() => {
        setToggle(!toggle);
        addNewSelectedUser(data);
        addChatToSelectedChat(data);
      }}
    >
      
        {
          // @ts-ignore
          <Image src={`${dataType === "user"? data?.profilePic : chatInfo(data?.users, loggedInUser, data).picture}`} alt="" width={47} height={47} style={{minWidth:"47px"}} className="of-hidden m-r-10 br-50"/>
        }
    

      <div className="sjfw flex ai-center jc-sb w-100">
        <div className="flex ai-start jc-start f-d-c primary-text-color">
          {
            //@ts-ignore
            <h4 className="primary-text-color">{dataType === "user" ? data?.username : chatInfo(data?.users, loggedInUser, data).name}
            </h4>
          }
        
          <p className="fs-small secondary-text-color" style={{marginTop:"4px"}}>Followed by aayush_singh</p>
        </div>

        {
          //@ts-ignore
          <button
          className={`btn bg-none br-50 c-pointer of-hidden flex ai-center jc-center ${selectedUsers.map((u) => u.id).includes(data.id) ? 'b-none' : ""}`}
            
          >
            {selectedUsers.map((u) => u.id).includes(data.id) ? (
              <MdDone
                style={{
                  color: "#222",
                  background: "#0095ff",
                  fontSize: "25px",
                }}
              />
            ) : null}
          </button>
        }
      </div>
    </div>
  );
};

export default SuggestionUserBox;
