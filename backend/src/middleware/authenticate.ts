import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
