import { Router } from "express";
import { ZodError } from "zod";
import { getTaskById } from "./tasks.service";
import { taskParamsSchema } from "./tasks.schemas";

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

export default router;
