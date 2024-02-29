import chatSlice from '@/slice/chatSlice'
import moreSlice from '@/slice/moreSlice'
import navbarSlice from '@/slice/navbarSlice'
import postSlice from '@/slice/postSlice'
import selectedUserSlice from '@/slice/selectedUserSlice'
import storySlice from '@/slice/storySlice'
import userSlice from '@/slice/userSlice'
import {configureStore} from '@reduxjs/toolkit'

export function createStore() {
     return configureStore({
        reducer:{
           navbar:navbarSlice,
           post:postSlice,
           chat:chatSlice,
           more:moreSlice,
           user:userSlice,
           selectedUser:selectedUserSlice,
           story:storySlice,
        }
     })
}

export const store = createStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch  = typeof store.dispatch