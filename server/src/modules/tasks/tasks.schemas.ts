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

export const updateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
    description: z
      .string()
      .trim()
      .max(5000, "Description is too long")
      .nullable()
      .optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    category: z.string().trim().max(100, "Category is too long").nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const moveTaskBodySchema = z.object({
  columnKey: z.nativeEnum(ColumnKey),
  position: z.number().int().min(0, "Position must be 0 or greater"),
});

export const archiveTaskBodySchema = z.object({
  archived: z.boolean(),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
export type MoveTaskBody = z.infer<typeof moveTaskBodySchema>;
export type ArchiveTaskBody = z.infer<typeof archiveTaskBodySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
