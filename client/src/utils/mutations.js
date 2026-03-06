import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation login($email: String, $username: String, $password: String!) {
    login(email: $email, username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        username
        email
      }
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation updatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const ADD_TRACK = gql`
  mutation addTrack($input: AddTrackInput!) {
    addTrack(input: $input) {
      id
      name
      streetAddress
      city
      state
      zipCode
      surfaceType
      isPublic
      lighting
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation addReview($input: AddReviewInput!) {
    addReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        username
      }
    }
  }
`;

export const SAVE_TRACK = gql`
  mutation saveTrack($trackId: ID!) {
    saveTrack(trackId: $trackId) {
      id
      username
      savedTracks {
        id
        name
        streetAddress
        city
      }
    }
  }
`;

export const REMOVE_TRACK = gql`
  mutation removeTrack($trackId: ID!) {
    removeTrack(trackId: $trackId) {
      id
      username
      savedTracks {
        id
        name
        streetAddress
        city
        state
      }
    }
  }
`;
