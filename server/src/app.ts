import cors from "cors";
import express from "express";
import { env } from "./config/env";

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

export default app;
