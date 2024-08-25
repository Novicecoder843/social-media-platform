import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    bio: String
    avatar: String
    followers: [User]
    following: [User]
    posts: [Post]
  }

  type Post {
    id: ID!
    author: User!
    content: String!
    media: [String]
    likes: [User]
    comments: [Comment]
    createdAt: String!
  }

  type Comment {
    id: ID!
    post: Post!
    author: User!
    content: String!
    likes: [User]
    createdAt: String!
  }

  type Notification {
    id: ID!
    user: User!
    type: String!
    content: String
    isRead: Boolean!
    createdAt: String!
  }

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    content: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getUser(id: ID!): User
    searchUsers(query: String!): [User]
    getCurrentUser: User
    getPost(id: ID!): Post
    getFeed: [Post]
    searchPosts(query: String!): [Post]
    getNotifications: [Notification]
    getMessages(receiverId: ID!): [Message]
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    followUser(userId: ID!): User
    unfollowUser(userId: ID!): User
    updateUserProfile(bio: String, avatar: String!): User
    createPost(content: String!, media: [String!]): Post
    updatePost(id: ID!, content: String, media: [String!]): Post
    deletePost(id: ID!): Boolean
    likePost(id: ID!): Post
    unlikePost(id: ID!): Post
    addComment(postId: ID!, content: String!): Comment
    editComment(id: ID!, content: String!): Comment
    deleteComment(id: ID!): Boolean
    likeComment(id: ID!): Comment
    unlikeComment(id: ID!): Comment
    sendMessage(receiverId: ID!, content: String!): Message
    markNotificationAsRead(id: ID!): Notification
    markAllNotificationsAsRead: [Notification]
  }
`;
