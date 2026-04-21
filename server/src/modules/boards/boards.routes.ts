import { Router } from "express";
import { ZodError } from "zod";
import { boardParamsSchema, createBoardBodySchema } from "./boards.schemas";
import { createBoard, getBoardById, getBoards, getBoardTasks } from "./boards.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const boards = await getBoards();

    response.status(200).json(boards);
  } catch (error) {
    next(error);
  }
});

router.get("/:boardId", async (request, response, next) => {
  try {
    const params = boardParamsSchema.parse(request.params);
    const board = await getBoardById(params.boardId);

    if (!board) {
      response.status(404).json({
        message: "Board not found.",
      });
      return;
    }

    response.status(200).json(board);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid route params.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

router.get("/:boardId/tasks", async (request, response, next) => {
  try {
    const params = boardParamsSchema.parse(request.params);
    const tasks = await getBoardTasks(params.boardId);

    if (!tasks) {
      response.status(404).json({
        message: "Board not found.",
      });
      return;
    }

    response.status(200).json(tasks);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid route params.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const body = createBoardBodySchema.parse(request.body);
    const board = await createBoard(body.title);

    response.status(201).json(board);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid request body.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

export default router;
