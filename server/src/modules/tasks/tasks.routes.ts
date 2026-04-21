import { Router } from "express";
import { ZodError } from "zod";
import { deleteTaskById, getTaskById, updateTaskById } from "./tasks.service";
import { taskParamsSchema, updateTaskBodySchema } from "./tasks.schemas";

const router = Router();

router.get("/:taskId", async (request, response, next) => {
  try {
    const params = taskParamsSchema.parse(request.params);
    const task = await getTaskById(params.taskId);

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

router.patch("/:taskId", async (request, response, next) => {
  try {
    const params = taskParamsSchema.parse(request.params);
    const body = updateTaskBodySchema.parse(request.body);

    const task = await updateTaskById(params.taskId, body);

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
    const params = taskParamsSchema.parse(request.params);
    const result = await deleteTaskById(params.taskId);

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
