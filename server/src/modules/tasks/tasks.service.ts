import { Prisma, TaskPriority } from "@prisma/client";
import prisma from "../../lib/prisma";

const DEMO_USER_EMAIL = "demo@example.com";

async function getDemoUserOrThrow() {
  const user = await prisma.user.findUnique({
    where: {
      email: DEMO_USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error("Demo user not found. Run the seed command first.");
  }

  return user;
}

export async function createTaskForBoard(input: {
  boardId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  columnKey: "TODO" | "IN_PROGRESS" | "DONE";
}) {
  const user = await getDemoUserOrThrow();

  const board = await prisma.board.findFirst({
    where: {
      id: input.boardId,
      ownerId: user.id,
    },
    include: {
      columns: true,
    },
  });

  if (!board) {
    return null;
  }

  const targetColumn = board.columns.find((column) => column.key === input.columnKey);

  if (!targetColumn) {
    throw new Error("Target column not found for board.");
  }

  const lastTask = await prisma.task.findFirst({
    where: {
      boardId: board.id,
      columnId: targetColumn.id,
    },
    orderBy: {
      position: "desc",
    },
  });

  const nextPosition = lastTask ? lastTask.position + 1 : 0;

  const createdTask = await prisma.task.create({
    data: {
      boardId: board.id,
      columnId: targetColumn.id,
      authorId: user.id,
      title: input.title,
      description: input.description || null,
      priority: input.priority ?? TaskPriority.MEDIUM,
      category: input.category || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      archived: false,
      position: nextPosition,
    },
    include: {
      column: {
        select: {
          id: true,
          key: true,
          title: true,
          position: true,
        },
      },
      taskTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return createdTask;
}

export async function getTaskById(taskId: string) {
  const user = await getDemoUserOrThrow();

  return prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        ownerId: user.id,
      },
    },
    include: {
      board: {
        select: {
          id: true,
          title: true,
        },
      },
      column: {
        select: {
          id: true,
          key: true,
          title: true,
          position: true,
        },
      },
      taskTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}
