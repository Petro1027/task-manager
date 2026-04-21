import { z } from "zod";

export const createBoardBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

export type CreateBoardBody = z.infer<typeof createBoardBodySchema>;
