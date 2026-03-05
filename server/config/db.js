import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/runwrld",
    );
  } catch (err) {
    console.error("MongoDB connection error: ", err);
    process.exit(1);
  }
}
