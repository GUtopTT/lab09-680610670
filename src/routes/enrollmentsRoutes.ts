import { Router, type Request, type Response } from "express";
import { DB } from "../db/db.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import { type CustomRequest } from "../libs/types.ts";

const router = Router();

router.get("/", authenticateToken, (req: Request, res: Response) => {
  const payload = (req as CustomRequest).user;

  if (payload?.role === "ADMIN") {
    return res.json({
      success: true,
      data: DB.enrollments,
    });
  }

  const data = DB.enrollments.filter(
    (e) => e.studentId === payload?.studentId
  );

  return res.json({
    success: true,
    data,
  });
});

router.post("/", authenticateToken, (req: Request, res: Response) => {
  const payload = (req as CustomRequest).user;

  if (payload?.role === "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const { courseId } = req.body;

  const found = DB.enrollments.find(
    (e) =>
      e.studentId === payload?.studentId &&
      e.courseId === courseId
  );

  if (found) {
    return res.status(400).json({
      success: false,
      message: "Enrollment already exists",
    });
  }

  const enrollment = {
    studentId: payload!.studentId!,
    courseId,
  };

  DB.enrollments.push(enrollment);

  return res.status(201).json({
    success: true,
    data: enrollment,
  });
});

router.delete("/", authenticateToken, (req: Request, res: Response) => {
  const payload = (req as CustomRequest).user;

  if (payload?.role === "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const { courseId } = req.body;

  const index = DB.enrollments.findIndex(
    (e) =>
      e.studentId === payload?.studentId &&
      e.courseId === courseId
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Enrollment not found",
    });
  }

  DB.enrollments.splice(index, 1);

  return res.json({
    success: true,
    message: "Enrollment deleted successfully",
  });
});

export default router;
