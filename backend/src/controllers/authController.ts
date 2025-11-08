import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import generateToken from "../utils/generateToken";

export const signup = async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Failed to sign up user" });
  }
};

export const login = async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: "true",
      sameSite: "strict",
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Failed to log in user" });
  }
};
