import { gql } from "apollo-server";

export default gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    username: String!
    email: String!
    savedTracks: [Track]
    contributions: [Track]
    profileImage: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    # Register a new user
    register(input: RegisterInput!): AuthPayload!

    # Login a user
    login(email: String, username: String, password: String!): AuthPayload!

    # Update user profile
    updateProfile(
      firstName: String
      lastName: String
      username: String
      profileImage: String
    ): User!

    # Update user password
    updatePassword(currentPassword: String!, newPassword: String!): Boolean!

    # Logout a user
    logout: Boolean!

    # Delete a user
    deleteUser: Boolean!
  }
`;
