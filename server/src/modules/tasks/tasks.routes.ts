import { Router } from "express";
import { ZodError } from "zod";
import { requireAuth } from "../auth/auth.middleware";
import {
  archiveTaskById,
  deleteTaskById,
  getTaskById,
  moveTaskById,
  updateTaskById,
} from "./tasks.service";
import {
  archiveTaskBodySchema,
  moveTaskBodySchema,
  taskParamsSchema,
  updateTaskBodySchema,
} from "./tasks.schemas";

const router = Router();

router.use(requireAuth);

router.get("/:taskId", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = taskParamsSchema.parse(request.params);
    const task = await getTaskById(authUser.userId, params.taskId);

    if (!task) {
      response.status(404).json({
        message: "Task not found.",
      });
      return;
    }

    response.status(200).json(task);
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

router.patch("/:taskId/archive", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = taskParamsSchema.parse(request.params);
    const body = archiveTaskBodySchema.parse(request.body);

    const task = await archiveTaskById(authUser.userId, params.taskId, body.archived);

    if (!task) {
      response.status(404).json({
        message: "Task not found.",
      });
      return;
    }

    response.status(200).json(task);
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

router.patch("/:taskId/move", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = taskParamsSchema.parse(request.params);
    const body = moveTaskBodySchema.parse(request.body);

    const task = await moveTaskById(authUser.userId, params.taskId, body);

    if (!task) {
      response.status(404).json({
        message: "Task not found.",
      });
      return;
    }

    response.status(200).json(task);
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

router.patch("/:taskId", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = taskParamsSchema.parse(request.params);
    const body = updateTaskBodySchema.parse(request.body);

    const task = await updateTaskById(authUser.userId, params.taskId, body);

    if (!task) {
      response.status(404).json({
        message: "Task not found.",
      });
      return;
    }

    response.status(200).json(task);
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

router.delete("/:taskId", async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const params = taskParamsSchema.parse(request.params);
    const result = await deleteTaskById(authUser.userId, params.taskId);

    if (!result) {
      response.status(404).json({
        message: "Task not found.",
      });
      return;
    }

    response.status(200).json(result);
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

export default router;
