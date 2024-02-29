import { gql } from "@apollo/client";

export const SIGN_IN = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password) {
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
export const SIGN_UP = gql`
  mutation SignUp($username: String!, $password: String!, $name: String!) {
    signUp(username: $username, password: $password, name: $name) {
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
export const ADD_POST = gql`
  mutation AddPost(
    $dataType: String!
    $postedBy: ID!
    $description: String!
    $uploadedData: [String!]!
    $objectFit: String!
    $viewsAndLikesHide: Boolean!
    $commentsOff: Boolean!
  ) {
    addPostAndReels(
      dataType: $dataType
      postedBy: $postedBy
      description: $description
      uploadedData: $uploadedData
      objectFit: $objectFit
      viewsAndLikesHide: $viewsAndLikesHide
      commentsOff: $commentsOff
    ) {
      id
      dataType
      likes
      comments
      shares
      postedBy {
        username
        id
        profilePic
        name
      }
      uploadedData
      description
      views
      reports
      viewsAndLikesHide
      commentsOff
      objectFit
      createdAt
    }
  }
`;
export const FOLLOW_USER = gql`
  mutation FollowUser($reqSendingUser: ID!, $reqReceivingUser: ID!) {
    followUser(
      reqSendingUser: $reqSendingUser
      reqReceivingUser: $reqReceivingUser
    ) {
      id
      receiver
      sender {
        id
        username
        profilePic
      }
      notificationType
      subject
      seenBy
      updatedAt
    }
  }
`;
export const UNFOLLOW_USER = gql`
  mutation UnFollowUser($reqSendingUser: ID!, $reqReceivingUser: ID!) {
    unFollowUser(
      reqSendingUser: $reqSendingUser
      reqReceivingUser: $reqReceivingUser
    ) {
      id
    }
  }
`;
export const INCREASE_VIEWS = gql`
  mutation IncreaseViews($userId: ID!, $postId: ID!, $dataType: String!) {
    increaseViews(userId: $userId, postId: $postId, dataType: $dataType)
  }
`;
export const ADD_COMMENT = gql`
  mutation AddComment(
    $dataType: String!
    $id: ID!
    $userId: ID!
    $text: String!
  ) {
    addComment(dataType: $dataType, id: $id, userId: $userId, text: $text) {
      id
      user {
        profilePic
        username
        id
        name
      }
      likes
      text
      createdAt
      loading
      totalReplys
      replys
    }
  }
`;
export const ADD_LIKE = gql`
  mutation AddLike($dataType: String!, $id: ID!, $userId: ID!) {
    addLike(dataType: $dataType, id: $id, userId: $userId) {
      username
      id
    }
  }
`;
export const REMOVE_LIKE = gql`
  mutation RemoveLike($dataType: String!, $id: ID!, $userId: ID!) {
    removeLike(dataType: $dataType, id: $id, userId: $userId) {
      username
      id
    }
  }
`;
export const NEW_MESSAGE = gql`
  mutation NewMessage(
    $user: ID!
    $dataType: String!
    $text: String!
    $chatId: ID!
    $postId: ID
    $uploaderUsername: String
    $description: String
    $messageId: String!
  ) {
    newMessage(
      user: $user
      dataType: $dataType
      text: $text
      chatId: $chatId
      postId: $postId
      uploaderUsername: $uploaderUsername
      description: $description
      messageId: $messageId
    ) {
      user {
        username
        id
        profilePic
        name
      }
      messageId
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
export const ADD_STORY = gql`
  mutation AddStory(
    $userId: ID!
    $dataType: String!
    $selfData: String
    $objectFit:String!
    $zoom:Int!
  ) {
    addStory(
      userId: $userId
      dataType: $dataType
      selfData: $selfData
      objectFit:$objectFit
      zoom:$zoom
    ) {
      id
      dataType
      user {
        id
        username
        profilePic
      }
      link
      seenBy {
        id
        username
        profilePic
      }
      createdAt
      selfData
      objectFit
      zoom
    }
  }
`;
export const VIEW_STORY = gql`
  mutation ViewStory($seenBy: ID!, $storyId: ID!) {
    viewStory(seenBy: $seenBy, storyId: $storyId) {
      seenBy {
        id
      }
    }
  }
`;
export const EDIT_PROFILE = gql`
  mutation EditProfile(
    $userId: ID!
    $profilePic: String
    $name: String
    $bio: String
    $link: String
    $gender: String
    $accountType: String
  ) {
    editProfile(
      userId: $userId
      profilePic: $profilePic
      name: $name
      bio: $bio
      link: $link
      gender: $gender
      accountType: $accountType
    ) {
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
export const REPLY_ON_COMMENT = gql`
  mutation ReplyOnComment($userId: ID!, $commentId: ID!, $text: String!) {
    replyOnComment(userId: $userId, commentId: $commentId, text: $text) {
      id
      user {
        profilePic
        username
        id
        name
      }
      likes
      text
      createdAt
      loading
      totalReplys
      replys
    }
  }
`;
export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: ID!, $dataType: String!, $userId: ID!) {
    handleLikeComments(
      commentId: $commentId
      dataType: $dataType
      userId: $userId
    ) {
      id
      name
      profilePic
      username
    }
  }
`;
export const SAVE_POST = gql`
  mutation SavePost($dataType: String!, $id: ID!, $userId: ID!) {
    savePost(dataType: $dataType, id: $id, userId: $userId) {
      id
    }
  }
`;
export const UNSAVE_POST = gql`
  mutation UnSavePost($dataType: String!, $id: ID!, $userId: ID!) {
    removeSavedPost(dataType: $dataType, id: $id, userId: $userId) {
      id
    }
  }
`;
export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
export const REMOVE_STORY = gql`
  mutation RemoveStory($storyId: ID!, $userId: ID!) {
    removeStory(storyId: $storyId, userId: $userId) {
      id
    }
  }
`;
export const MESSAGE_SEEN = gql`
  mutation Message_Seen($messagesId: [ID]!, $userId: ID!) {
    messageSeen(messagesId: $messagesId, userId: $userId) {
      id
    }
  }
`;
export const CANCLE_FOLLOW_REQUEST = gql`
  mutation CancleFollowRequest($receiverId: ID!, $senderId: ID!) {
    cancleFollowRequest(receiverId: $receiverId, senderId: $senderId) {
      id
    }
  }
`;
export const NEW_NOTIFICATION = gql`
  mutation New_Notification(
    $subject: String!
    $receiverId: ID!
    $senderId: ID!
    $text: String
    $notificationType: String!
    $postId: ID
    $reelId: ID
  ) {
    newNotification(
      subject: $subject
      receiverId: $receiverId
      senderId: $senderId
      text: $text
      notificationType: $notificationType
      postId: $postId
      reelId: $reelId
    ) {
      id
      receiver
      sender {
        id
        username
        profilePic
      }
      text
      subject
      notificationType
      post {
        id
        uploadedData
      }
      reel {
        id
        uploadedData
      }
      updatedAt
      seenBy
    }
  }
`;
export const ACCEPT_FOLLOW_REQUEST = gql`
  mutation AcceptFollowRequest(
    $receiver: ID!
    $sender: ID!
    $notificationId: ID!
  ) {
    acceptFollowRequest(
      receiver: $receiver
      sender: $sender
      notificationId: $notificationId
    ) {
      id
      seenBy
      receiver
      sender {
        id
        username
        profilePic
      }
      text
      subject
      notificationType
      post {
        id
        uploadedData
      }
      reel {
        id
        uploadedData
      }
      updatedAt
    }
  }
`;
export const SEEN_NOTIFICATIONS = gql`
mutation SeenNotification($notificationIds:[ID]!,$userId:ID!){
  seenNotifications(notificationIds:$notificationIds,userId:$userId) 
}
`
export const EDIT_POST = gql`
mutation EditPost($dataType:String!,$postId:ID!,$description:String,$viewsAndLikesHide:Boolean,$commentsOff:Boolean){
  editPost(dataType:$dataType,postId:$postId,description:$description,viewsAndLikesHide:$viewsAndLikesHide,commentsOff:$commentsOff){
    id
  }
}
`
export const REMOVE_POST = gql`
mutation RemovePost($dataType:String!,$userId:ID!,$postId:ID!){
  removePost(dataType:$dataType,userId:$userId,postId:$postId){
    id
  }
}
`

export const DELETE_COMMENT = gql`
mutation DeleteComment($commentId:ID,$isReply:Boolean,$replyId:ID){
  deleteComment(commentId:$commentId,isReply:$isReply,replyId:$replyId) 
}
`