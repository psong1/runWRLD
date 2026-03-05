import { gql } from "apollo-server";
import userTypeDefs from "./users/user.typedefs.js";
import trackTypeDefs from "./tracks/track.typedefs.js";
import reviewTypeDefs from "./reviews/review.typedefs.js";

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export default [baseTypeDefs, userTypeDefs, trackTypeDefs, reviewTypeDefs];
