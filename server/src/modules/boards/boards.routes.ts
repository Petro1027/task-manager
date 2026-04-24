import { Router } from "express";
import { ZodError } from "zod";
import { requireAuth } from "../auth/auth.middleware";
import { createTaskBodySchema } from "../tasks/tasks.schemas";
import { createTaskForBoard } from "../tasks/tasks.service";
import { boardParamsSchema, createBoardBodySchema } from "./boards.schemas";
import { createBoard, getBoardById, getBoards, getBoardTasks } from "./boards.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const boards = await getBoards(authUser.userId);

    response.status(200).json(boards);
  } catch (error) {
    next(error);
  }
});

router.get("/:boardId", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = boardParamsSchema.parse(request.params);
    const board = await getBoardById(authUser.userId, params.boardId);

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
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = boardParamsSchema.parse(request.params);
    const tasks = await getBoardTasks(authUser.userId, params.boardId);

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

router.post("/:boardId/tasks", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = boardParamsSchema.parse(request.params);
    const body = createTaskBodySchema.parse(request.body);

    const task = await createTaskForBoard({
      userId: authUser.userId,
      boardId: params.boardId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      category: body.category,
      dueDate: body.dueDate,
      columnKey: body.columnKey,
    });

    if (!task) {
      response.status(404).json({
        message: "Board not found.",
      });
      return;
    }

    response.status(201).json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid request.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const body = createBoardBodySchema.parse(request.body);
    const board = await createBoard(authUser.userId, body.title);

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
