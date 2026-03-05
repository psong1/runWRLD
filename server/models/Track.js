import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    isPublic: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

trackSchema.index({ location: "2dsphere" });

export default mongoose.model("Track", trackSchema);
