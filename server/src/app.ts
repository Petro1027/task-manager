import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

export default app;
