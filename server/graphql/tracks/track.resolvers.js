import Track from "../../models/Track.js";
import Review from "../../models/Review.js";
import User from "../../models/User.js";

export default {
  Query: {
    tracks: async () => await Track.find(),

    track: async (_, { id }) => await Track.findById(id),

    tracksNearby: async (_, { lat, lng, radius = 10 }) => {
      const radiusInMeters = radius * 1609.34;

      return await Track.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusInMeters,
          },
        },
      });
    },

    searchTracks: async (_, { searchTerm }) => {
      return await Track.find({ name: { $regex: searchTerm, $options: "i" } });
    },
  },

  Mutation: {
    addTrack: async (_, { input }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const { lat, lng, name, ...otherFields } = input;

      let track = await Track.findOne({
        "location.coordinates": [lng, lat],
        name: name,
      });

      if (!track) {
        track = await Track.create({
          name,
          ...otherFields,
          location: { type: "Point", coordinates: [lng, lat] },
          addedBy: context.user.id,
        });
      }

      await User.findByIdAndUpdate(context.user.id, {
        $addToSet: { savedTracks: track._id },
      });

      return track;
    },

    saveTrack: async (_, { trackId }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      return await User.findByIdAndUpdate(
        context.user.id,
        { $addToSet: { savedTracks: trackId } },
        { new: true },
      ).populate("savedTracks");
    },

    removeTrack: async (_, { trackId }, context) => {
      if (!context.user) throw new Error("Authentication required");

      return await User.findByIdAndUpdate(
        context.user.id,
        { $pull: { savedTracks: trackId } },
        { new: true },
      ).populate("savedTracks");
    },

    updateTrack: async (_, { input }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const { id, ...updateData } = input;
      return await Track.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      );
    },

    addTrackPhoto: async (_, { trackId, url }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const track = await Track.findById(trackId);
      if (!track) throw new Error("Track not found");

      const photo = {
        url,
        contributor: context.user.id,
        isVerified: false,
      };

      track.photos.push(photo);
      await track.save();

      return track.photos[track.photos.length - 1];
    },

    addStatusUpdate: async (_, { trackId, status, description }, context) => {
      if (!context.user) throw new Error("Authentication required");

      const track = await Track.findById(trackId);
      if (!track) throw new Error("Track not found");

      const statusUpdate = {
        track: trackId,
        user: context.user.id,
        status,
        description,
        createdAt: new Date().toISOString(),
      };

      track.statusUpdates.push(statusUpdate);
      await track.save();
      return track.statusUpdates[track.statusUpdates.length - 1];
    },
  },

  Track: {
    id: (parent) =>
      parent._id
        ? parent._id.toString()
        : (parent.id?.toString?.() ?? parent.id),

    surfaceType: (parent) => parent.surfaceType ?? "Unknown",

    address: (parent) => {
      const parts = [
        parent.streetAddress,
        parent.city,
        parent.state,
        parent.zipCode,
      ].filter(Boolean);
      return parts.join(", ") || "";
    },
    lat: (parent) => parent.location?.coordinates?.[1] ?? 0,
    lng: (parent) => parent.location?.coordinates?.[0] ?? 0,

    addedBy: async (parent) => await User.findById(parent.addedBy),

    reviews: async (parent) => await Review.find({ track: parent.id }),

    averageRating: async (parent) => {
      const reviews = await Review.find({ track: parent.id });
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / reviews.length;
      return Math.round(average * 10) / 10;
    },
  },
};
