import userResolvers from "./users/user.resolvers.js";
import trackResolvers from "./tracks/track.resolvers.js";
import reviewResolvers from "./reviews/review.resolvers.js";

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...trackResolvers.Query,
    ...reviewResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...trackResolvers.Mutation,
    ...reviewResolvers.Mutation,
  },

  Track: {
    ...trackResolvers.Track,
  },
  User: {
    ...userResolvers.User,
  },
  Review: {
    ...reviewResolvers.Review,
  },
};

export default resolvers;
