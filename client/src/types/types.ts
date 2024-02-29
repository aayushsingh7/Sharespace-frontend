export type UserType = {
  id: string;
  name: string;
  email: string;
  posts: PostType[]; // Use PostType[] for array type
  followers: string[];
  following: string[];
  username: string;
  bio: string;
  link: string;
  gender: string;
  profilePic: string;
  savedPosts: string[];
  savedReels: string[];
  story: StoryType[];
  accountType: string;
  requests: string[];
  reels: ReelType[];
  reports: number;
  verified: boolean;
  createdAt: string;
};

export type PostType = {
  id: string;
  dataType: string;
  likes: UserType[];
  comments: CommentType[];
  shares: number;
  postedBy: UserType;
  description: string;
  uploadedData: string[];
  views: string[];
  reports: number;
  viewsAndLikesHide: false;
  commentsOff: false;
  objectFit: string;
  createdAt: string;
};

export type StoryType = {
  id: string;
  user: UserType;
  post: PostType;
  link: string;
  seenBy: UserType[];
  createdAt: string;
  reel: ReelType;
  selfData: string;
  text: string;
  position: {
    top: string;
    left: string;
    changed: boolean;
  };
  zoom:number;
  objectFit:string;
};

export type ReelType = {
  id: string;
  dataType: string;
  likes: string[];
  comments: CommentType[];
  shares: number;
  postedBy: UserType;
  description: string;
  uploadedData: string[];
  views: string[];
  reports: number;
  viewsAndLikesHide: false;
  commentsOff: false;
  createdAt: string;
};

export type CommentType = {
  id: string;
  user: UserType;
  text: string;
  createdAt: string;
  likes: string[];
  postId: string;
  totalReplys: number;
  replys: CommentType[];
  loading: boolean;
  isReply:boolean,
};

export type ChatType = {
  id: string;
  isGroupChat: boolean;
  name: string;
  users: UserType[];
  deletedFor: string[];
  messages: MessageType[];
  latestMessage: MessageType;
  admins: string[];
  createdBy: UserType;
  picture: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = {
  id: string;
  user: UserType;
  reaction: string;
  deleted: boolean;
  text: string;
  reply: MessageType[];
  dataType: string;
  createdAt: string;
  postInfo: PostType;
  seenBy:UserType[];
  messageId:string;
  loading?:boolean,
  status?:string,
};
