import { StoryType } from "@/types/types";
import User from "./user";
import Post from "./post";
import Reel from "./reel";

let Story: StoryType = {
  id: "",
  user: User,
  post: Post,
  link: "",
  seenBy: [],
  createdAt: "",
  reel: Reel,
  selfData: "",
  text: "",
  position: {
    top: "",
    left: "",
    changed: false,
  },
  zoom:100,
  objectFit:"square"
};

export default Story;
