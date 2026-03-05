import { gql } from "apollo-server";

export default gql`
  type Review {
    id: ID!
    user: User!
    track: Track!
    rating: Int!
    comment: String
    createdAt: String!
  }

  input AddReviewInput {
    trackId: ID!
    rating: Int!
    comment: String
  }

  input UpdateReviewInput {
    id: ID!
    rating: Int
    comment: String
  }

  extend type Track {
    reviews: [Review]
    averageRating: Float
  }

  extend type User {
    reviews: [Review]
  }

  extend type Query {
    review(id: ID!): Review
    trackReviews(trackId: ID!): [Review]
  }

  extend type Mutation {
    # Add a review for a track
    addReview(input: AddReviewInput!): Review!

    # Update a review
    updateReview(input: UpdateReviewInput!): Review!

    # Delete a review
    deleteReview(reviewId: ID!): Boolean!
  }
`;
