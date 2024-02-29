import { gql } from "@apollo/client";

export const GET_USER = gql`
  query GetUser($username: String!) {
    user(username: $username) {
      id
      name
      email
      posts
      followers
      following
      username
      bio
      link
      gender # Fix the typo from "genrder" to "gender"
      profilePic
      savedPosts
      savedReels
      story
      accountType
      requests
      reels
      verified
    }
  }
`;
export const USER_POSTS = gql`
  query UserPosts($userId: ID!, $offset: Int!) {
    userPosts(userId: $userId, offset: $offset) {
      id
      dataType
      likes
      objectFit
      comments
      uploadedData
      postedBy {
        id
        username
        profilePic
      }
    }
  }
`;
export const USER_REELS = gql`
  query userReels($userId: ID!, $offset: Int!) {
    userReels(userId: $userId, offset: $offset) {
      id
      dataType
      likes
      comments
      uploadedData
      postedBy {
        id
        username
        profilePic
      }
    }
  }
`;
export const POST = gql`
  query Post($postId: ID!, $dataType: String!) {
    post(postId: $postId, dataType: $dataType) {
      id
      dataType
      likes
      shares
      postedBy {
        username
        id
        profilePic
      }
      description
      uploadedData
      views
      reports
      viewsAndLikesHide
      commentsOff
      objectFit
      createdAt
      comments
    }
  }
`;
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!,$username:String!) {
    searchUsers(query: $query,username:$username) {
      id
      name
      username
      profilePic
      verified
    }
  }
`;
export const POSTS = gql`
  query Posts($userId: ID!, $skip:Int!) {
    posts(userId: $userId, skip:$skip) {
      id
      dataType
      likes
      objectFit
      comments
      uploadedData
      createdAt
      viewsAndLikesHide
      commentsOff
      description
      postedBy {
        id
        username
        profilePic
      }
    }
  }
`;
export const FOLLOWERS = gql`
  query Followers($userId: ID!) {
    followers(userId: $userId) {
      id
      username
      name
      profilePic
    }
  }
`;
export const FOLLOWING = gql`
  query Following($userId: ID!) {
    following(userId: $userId) {
      id
      username
      name
      profilePic
    }
  }
`;
export const GET_COMMENTS = gql`
  query GetComments($postId: ID!, $offset: Int!) {
    getComments(postId: $postId, offset: $offset) {
      id
      user {
        profilePic
        username
        id
      }
      totalReplys
      text
      createdAt
      likes
      replys
      loading
      isReply
    }
  }
`;
export const LOGGED_IN_USER = gql`
  query LoggedInUser {
    loggedInUser {
      id
      name
      email
      posts
      followers
      following
      username
      bio
      link
      gender # Fix the typo from "genrder" to "gender"
      profilePic
      savedPosts
      savedReels
      story
      accountType
      requests
      reels
      verified
    }
  }
`;
export const CHATS = gql`
  query Chats($userId: ID!) {
    chats(userId: $userId) {
      id
      isGroupChat
      name
      users {
        id
        username
        profilePic
        name
      }
      deletedFor
      messages {
        messageId
        seenBy
      }
      latestMessage {
        user {
          id
          username
          profilePic
          name
        }
        text
        createdAt
        deleted
        dataType
      }
      admins
      createdBy {
        id
        username
        profilePic
      }
      picture
      createdAt
      updatedAt
    }
  }
`;
export const CHAT = gql`
  query Chat($users: [ID!]!, $isGroupChat: Boolean!, $loggedInUser: ID!) {
    chat(
      users: $users
      isGroupChat: $isGroupChat
      loggedInUser: $loggedInUser
    ) {
      id
      isGroupChat
      name
      users {
        id
        username
        profilePic
        name
      }
      deletedFor
      messages {
        id
        seenBy
      }
      latestMessage {
        user {
          id
          username
          profilePic
          name
        }
        text
        createdAt
        deleted
      }
      admins
      createdBy {
        id
        username
        profilePic
      }
      picture
      createdAt
      updatedAt
    }
  }
`;
export const MESSAGES = gql`
  query Messages($chatId: ID!) {
    messages(chatId: $chatId) {
      messageId
      user {
        username
        profilePic
        name
        id
      }
      text
      reaction
      deleted
      dataType
      createdAt
      seenBy
      status
      postInfo {
        id
        dataType
        postedBy {
          username
          profilePic
        }
        uploadedData
        description
      }
    }
  }
`;
export const SUGGESTED = gql`
  query Suggested($userId: ID!) {
    suggested(userId: $userId) {
      id
      isGroupChat
      name
      users {
        id
        username
        profilePic
        name
      }
      deletedFor
      picture
      createdAt
      updatedAt
    }
  }
`;
export const STORIES = gql`
  query Stories($userId: ID!) {
    stories(userId: $userId) {
      id
      user {
        username
        id
        profilePic
      }
      createdAt
      seenBy {
        id
      }
      selfData
      zoom
      objectFit
    }
  }
`;
export const REPLYS = gql`
  query Replys($commentId: ID!, $offset: Int!) {
    replys(commentId: $commentId, offset: $offset) {
      id
      user {
        username
        profilePic
        id
      }
      text
      createdAt
      likes
      loading
      isReply
    }
  }
`;
export const REELS = gql`
  query Reels($userId: ID!,$skip:Int!) {
    reels(userId: $userId,skip:$skip) {
      id
      dataType
      likes
      comments
      uploadedData
      description
      commentsOff
      viewsAndLikesHide
      postedBy {
        id
        username
        profilePic
      }
    }
  }
`;
export const SAVED_POSTS = gql`
  query SavedPosts($userId: ID!, $skip: Int!) {
    savedPostAndReels(userId: $userId, skip: $skip) {
      id
      uploadedData
      dataType
    }
  }
`;
export const OWN_STORY = gql`
  query OwnStory($userId: ID!) {
    ownStory(userId: $userId) {
      id
      user {
        username
        id
        profilePic
      }
      createdAt
      seenBy {
        id
      }
      selfData
    }
  }
`;
export const UN_READ_MESSAGES = gql`
query UnReadMessages($userId:ID!){
  unReadChats(userId:$userId){
    id
  }
}
`
export const NOTIFICATIONS = gql`
query Notifications($userId:ID!){
    notifications(userId:$userId){
      id
      receiver
    sender{
      username
      id
      profilePic
    }
    subject
    text
    notificationType
    post {
      id
      dataType
      uploadedData
    }
    reel {
      id
      dataType
      uploadedData
    }
    seenBy 
    updatedAt
    }
}
`
export const UN_SEEN_NOTIFICATIONS =  gql`
query UnSeenNotifications($userId:ID!){
  unSeenNotifications(userId:$userId){
    id
  }
}
`
export const CHAT_AVAILABLE = gql`
query ChatAvailable($users: [ID!]!, $isGroupChat: Boolean!, $loggedInUser: ID!){
  chatAvailable(  users: $users,isGroupChat: $isGroupChat,loggedInUser: $loggedInUser)
    {
      id
      isGroupChat
      name
      users {
        id
        username
        profilePic
        name
      }
      deletedFor
      messages {
        id
        seenBy
      }
      latestMessage {
        user {
          id
          username
          profilePic
          name
        }
        text
        createdAt
        deleted
      }
      admins
      createdBy {
        id
        username
        profilePic
      }
      picture
      createdAt
      updatedAt
    }
  
}
`
export const STORY = gql`
query Story($storyId:ID!){
  story(storyId:$storyId){
    id
      user {
        username
        id
        profilePic
      }
      seenBy {
        id
      }
      selfData
      createdAt
      zoom
      objectFit
  }
}
`