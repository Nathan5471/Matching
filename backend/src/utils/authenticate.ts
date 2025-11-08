import prisma from "../prisma/client";
import jwt from "jsonwebtoken";

const authenticate = async (token: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    return user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

export default authenticate;
