import express, { type Request, type Response } from "express";

// import middlewares
import morgan from "morgan";
import invalidJsonMiddleware from "./middlewares/invalidJsonMiddleware.ts";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.ts";
import { authenticateToken } from "./middlewares/authenMiddleware.ts";

// import routes
import studentRouter_v2 from "./routes/studentsRoutes_v2.ts";
import studentRouter_v3 from "./routes/studentsRoutes_v3.ts";
import courseRouter_v2 from "./routes/coursesRouters_v2.ts";
import usersRouter from "./routes/usersRoutes.ts";
import enrollmentsRouter from "./routes/enrollmentsRoutes.ts";

import { type CustomRequest } from "./libs/types.ts";

const app = express();
const port = 3000;

// body parser middleware
app.use(express.json());

// logger middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));

// JSON parser middleware
app.use(invalidJsonMiddleware);

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("Lecture09 API services");
});

app.use("/api/v2/students", studentRouter_v2);
app.use("/api/v3/students", studentRouter_v3);
app.use("/api/v2/courses", courseRouter_v2);
app.use("/api/v2/users", usersRouter);
app.use("/api/v2/enrollments", enrollmentsRouter);

// endpoint check middleware

app.get("/api/me", authenticateToken, (req, res) => {
  const user = (req as CustomRequest).user;

  res.json({
    success: true,
    data: {
      studentId: user?.studentId,
      username: user?.username,
      role: user?.role,
    },
  });
});

app.use(notFoundMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// Export app for vercel deployment
export default app;
