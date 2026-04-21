import { Router } from "express";
import { ZodError } from "zod";
import { createBoardBodySchema } from "./boards.schemas";
import { createBoard, getBoards } from "./boards.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const boards = await getBoards();

    response.status(200).json(boards);
  } catch (error) {
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
