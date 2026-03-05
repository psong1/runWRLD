import { ApolloServer } from "apollo-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import typeDefs from "./graphql/typedefs.js";
import resolvers from "./graphql/resolvers.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true,

  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    const user = await authMiddleware(token);
    return { user };
  },
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    return server.listen({ port: process.env.PORT || 4000 });
  })
  .then(({ url }) => {
    console.log(`runWRLD is ready at ${url}`);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
