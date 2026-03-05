import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true },
);

reviewSchema.index({ user: 1, track: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
