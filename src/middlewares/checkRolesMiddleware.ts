import { type Response, type NextFunction } from "express";
import { users } from "../db/db.ts";
import { type CustomRequest, type User } from "../libs/types.ts";

export const checkRoles = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.user;

  const user = users.find(
    (u: User) => u.username === payload?.username
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  next();
};
