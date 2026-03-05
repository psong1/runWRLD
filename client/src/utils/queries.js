import { gql } from "@apollo/client";

export const GET_NEARBY_TRACKS = gql`
  query GetNearbyTracks($lat: Float!, $lng: Float!, $radius: Float) {
    tracksNearby(lat: $lat, lng: $lng, radius: $radius) {
      id
      name
      streetAddress
      city
      surfaceType
      location {
        coordinates
      }
      averageRating
      isPublic
    }
  }
`;

export const GET_ME = gql`
  query me {
    me {
      id
      username
      email
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
