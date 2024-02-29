import { UserType } from "@/types/types"

export const getSecondUser = (users:UserType[],loggedInUser:UserType):UserType=> {
    const secondUser = users.filter((user:UserType)=> user.id !== loggedInUser.id)
    return secondUser[0]
}