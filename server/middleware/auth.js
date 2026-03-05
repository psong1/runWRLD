import jwt from "jsonwebtoken";

export const authMiddleware = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const cleanToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(err);
    return null;
  }
};
