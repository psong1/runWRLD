import { gql } from "apollo-server";

export default gql`
  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type Location {
    coordinates: [Float]!
  }

  type Track {
    id: ID!
    name: String!
    streetAddress: String!
    city: String!
    state: String!
    zipCode: String!
    location: Location!
    surfaceType: String!
    isPublic: Boolean!
    lighting: Boolean!
    verifiedBy: [User]
    addedBy: User!
    createdAt: String!
  }

  type TrackStatusUpdate {
    id: ID!
    track: Track!
    user: User!
    status: String!
    description: String
    createdAt: String!
  }

  type TrackPhoto {
    id: ID!
    url: String!
    contributor: User!
    isVerified: Boolean!
  }

  type VerifiedInfo {
    id: ID!
    bathrooms: Boolean!
    waterFountain: Boolean!
    parking: String!
    lanes: Int!
  }

  input AddTrackInput {
    name: String!
    streetAddress: String!
    city: String!
    state: String!
    zipCode: String!
    surfaceType: String!
    isPublic: Boolean!
    lighting: Boolean!
    lat: Float!
    lng: Float!
  }

  input UpdateTrackInput {
    id: ID!
    isPublic: Boolean
    lighting: Boolean
    surfaceType: String
    bathrooms: Boolean
    parking: String
  }

  extend type Query {
    # Find a single track by ID
    track(id: ID!): Track!

    # Get all tracks
    tracks: [Track]

    # Geo-Search to find tracks within a specific radius
    tracksNearby(lat: Float!, lng: Float!, radius: Float): [Track]

    # Search by name or city
    searchTracks(searchTerm: String!): [Track]
  }

  extend type Mutation {
    # Add a new track
    addTrack(input: AddTrackInput!): Track!

    # Update a track -- to add photos and public status
    updateTrack(input: UpdateTrackInput!): Track!

    # Add a photo to a track
    addTrackPhoto(trackId: ID!, url: String!): TrackPhoto!

    # Report feature
    addStatusUpdate(
      trackId: ID!
      status: String!
      description: String
    ): TrackStatusUpdate!
  }
`;
