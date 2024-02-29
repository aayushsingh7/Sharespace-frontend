import Story from "@/models/story";
import { StoryType } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";
import { stat } from "fs";

const initialState = {
  stories: [],
  myStory: {},
  loadStory: true,
};

const storySlice = createSlice({
  name: "storySlice",
  initialState,
  reducers: {
    setStories(state, action) {
      state.stories = action.payload;
    },
    addStory(state, action) {
      state.myStory = action.payload;
    },
    removeStory(state, action) {
      state.myStory = {};
    },
    storySeen(state, action) {
      if (action.payload.type === "myself") {
        //@ts-ignore
        state.myStory.seenBy = [
        //@ts-ignore
          ...state.myStory.seenBy,
          {
            id:action.payload.userId,
            __typename: 'UserType'
          }
        ]
      } else {
        if (action.payload.storyID) {
            //@ts-ignore
          state.stories = state.stories.map((story: StoryType) => {
            if (story.id === action.payload.storyID) {
              return {
                ...story,
                seenBy: [...story.seenBy, {
                    id:action.payload.userId,
                    __typename: 'UserType'
                  }],
              };
            } else {
              return story;
            }
          });
        }
      }
    },
    handleloadStory(state, action) {
      state.loadStory = action.payload;
    },
  },
});

export const { setStories, addStory, removeStory, handleloadStory, storySeen } =
  storySlice.actions;
export default storySlice.reducer;
