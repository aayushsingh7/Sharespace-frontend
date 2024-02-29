import { MESSAGES } from "@/graphQl/queries";
import { ChatType } from "@/types/types";

const handleMessageCacheAndStatus = (
  client: any,
  status: string,
  selectedChat: ChatType,
  newMessage: any
) => {

  const prevMsg = client.readQuery({
    query: MESSAGES,
    variables: {
      chatId: selectedChat.id,
    },
  });


  console.log({
    topic:"---------------------------------------------------------------------------",
    prevMsg:prevMsg,
    newMessage:newMessage
  })

  if (!prevMsg) return;


  client.writeQuery({
    query: MESSAGES,
    variables: {
      chatId: selectedChat.id,
    },
    data:
      status === "sending"
        ? {
            //@ts-ignore
            messages: [
              ...prevMsg?.messages,
              { ...newMessage, status: "sending" },
            ],
          }
        : {
            //@ts-ignore
            messages: prevMsg.messages.map((message: MessageType) => {
              if (message.messageId === newMessage.messageId) {
                return {
                  ...newMessage,
                  status: "failed",
                };
              } else {
                return message;
              }
            }),
          },
  });
};

export default handleMessageCacheAndStatus;
