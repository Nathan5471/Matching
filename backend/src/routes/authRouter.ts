import { Router } from "express";
import { signup, login } from "../controllers/authController";
import authenticate from "../middleware/authenticate";
import { User } from "@prisma/client";

const router = Router();

router.post("/signup", async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  await signup(req, res);
});

router.post("/login", async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  await login(req, res);
});

router.get("/current", authenticate, (req: any, res: any) => {
  const user = req.user as User;
  res.status(200).json({
    id: user.id,
    username: user.username,
  });
});

export default router;
