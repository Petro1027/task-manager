import { z } from "zod";

export const createBoardBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

export const boardParamsSchema = z.object({
  boardId: z.string().trim().min(1, "Board ID is required"),
});

export type CreateBoardBody = z.infer<typeof createBoardBodySchema>;
export type BoardParams = z.infer<typeof boardParamsSchema>;
