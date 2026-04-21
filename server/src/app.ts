import cors from "cors";
import express from "express";
import { env } from "./config/env";
import boardsRoutes from "./modules/boards/boards.routes";
import tasksRoutes from "./modules/tasks/tasks.routes";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_request, response) => {
  response.status(200).send("Task Manager API is running");
});

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.use("/api/boards", boardsRoutes);
app.use("/api/tasks", tasksRoutes);

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);

    response.status(500).json({
      message: "Internal server error.",
    });
  },
);

export default app;
