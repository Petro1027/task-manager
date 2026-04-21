import { ColumnKey, TaskPriority } from "@prisma/client";
import { z } from "zod";

export const taskParamsSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
});

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  category: z.string().trim().max(100, "Category is too long").optional(),
  dueDate: z.string().datetime().optional(),
  columnKey: z.nativeEnum(ColumnKey),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
