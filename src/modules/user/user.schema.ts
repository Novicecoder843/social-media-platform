import { gql } from 'apollo-server-express';

export const userTypeDefs = gql`
    type User {
        id: ID!
        username: String!
        email: String!
        bio: String
        avatar: String
        followers: [User!]!
        following: [User!]!
        posts: [Post!]!
    }

    type Query {
        me: User
        users: [User!]!
        user(id: ID!): User
    }

    type Mutation {
        signUp(username: String!, email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        followUser(userId: ID!): User!
        unfollowUser(userId: ID!): User!
    }

    type AuthPayload {
        token: String!
        user: User!
    }
`;
