import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { useRouter } from "next/router";

const initialState = {
   openSideNav: true,
   userSearch: false,
   moreOptions: false,
};

const navbarSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
      handleOpenSideNav(state, action) {
         state.openSideNav = action.payload;
      },
      handleUserSearch(state, action) {
         state.userSearch = action.payload
      },
   },
});

export const { handleOpenSideNav, handleUserSearch } = navbarSlice.actions;
export default navbarSlice.reducer;
