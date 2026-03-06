import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;
      return await User.findById(context.user.id).populate("savedTracks");
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const {
        username,
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
      } = input;

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) throw new Error("User already exists");

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
      });

      const token = generateToken(user);
      return { token, user };
    },

    login: async (_, { email, username, password }) => {
      const user = await User.findOne({ $or: [{ email }, { username }] });

      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");

      const token = generateToken(user);
      return { token, user };
    },

    updateProfile: async (_, args, context) => {
      if (!context.user) throw new Error("Unauthorized");

      return await User.findByIdAndUpdate(
        context.user.id,
        { $set: args },
        { new: true },
      );
    },

    updatePassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      const user = await User.findById(context.user.id);
      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) throw new Error("Current password is incorrect");

      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters");
      }

      // Assign plain password; User model pre-save hook hashes it (single hash)
      user.password = newPassword;
      await user.save();
      return true;
    },

    logout: async () => {
      return true;
    },

    deleteUser: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized");

      await User.findByIdAndDelete(context.user.id);
      return true;
    },
  },
};
