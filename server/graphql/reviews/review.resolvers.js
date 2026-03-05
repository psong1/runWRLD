import Review from "../../models/Review.js";
import User from "../../models/User.js";
import Track from "../../models/Track.js";

export default {
  Query: {
    review: async (_, { id }) => await Review.findById(id),
    trackReviews: async (_, { trackId }) =>
      await Review.find({ track: trackId }),
  },

  Mutation: {
    addReview: async (_, { input }, context) => {
      if (!context.user)
        throw new Error("Authentication required to leave a review");

      const { trackId, rating, comment } = input;

      return await Review.create({
        track: trackId,
        user: context.user.id,
        rating,
        comment,
      });
    },

    updateReview: async (_, { input }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const { id, rating, comment } = input;

      const review = await Review.findById(id);
      if (!review) throw new Error("Review not found");
      if (review.user.toString() !== context.user.id)
        throw new Error("You are not authorized to update this review");

      return await Review.findByIdAndUpdate(
        id,
        { rating, comment },
        { new: true },
      );
    },

    deleteReview: async (_, { reviewId }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");
      if (review.user.toString() !== context.user.id)
        throw new Error("You are not authorized to delete this review");

      await Review.findByIdAndDelete(reviewId);
      return true;
    },
  },

  Review: {
    user: async (review) => await User.findById(review.user),
    track: async (review) => await Track.findById(review.track),
  },

  User: {
    reviews: async (user) => await Review.find({ user: user.id }),
  },
};
