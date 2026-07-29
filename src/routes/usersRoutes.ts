import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { users, reset_users } from "../db/db.ts";
import type { User } from "../libs/types.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import type { CustomRequest } from "../libs/types.ts";

const router = Router();

router.get("/", authenticateToken, (req: Request, res: Response) => {
  const payload = (req as CustomRequest).user;

  const user = users.find((u) => u.username === payload?.username);

  if (!user || user.role !== "ADMIN") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  return res.json({
    success: true,
    data: users,
  });
});

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find(
    (u: User) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";

  const token = jwt.sign(
    {
      username: user.username,
      studentId: user.studentId,
      role: user.role,
    },
    jwt_secret,
    { expiresIn: "30m" }
  );

  user.tokens = user.tokens ? [...user.tokens, token] : [token];

  return res.json({
    success: true,
    message: "Login successful",
    token,
  });
});

router.post(
  "/logout",
  authenticateToken,
  (req: Request, res: Response) => {
    const payload = (req as CustomRequest).user;
    const token = (req as CustomRequest).token!;

    const user = users.find((u) => u.username === payload?.username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!user.tokens || !user.tokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.tokens = user.tokens.filter((t) => t !== token);

    return res.json({
      success: true,
      message: "Logout successful",
    });
  }
);

router.post("/reset", (req: Request, res: Response) => {
  reset_users();

  return res.json({
    success: true,
    message: "User database has been reset",
  });
});

export default router;
