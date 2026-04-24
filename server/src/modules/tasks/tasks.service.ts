import { ColumnKey, Prisma, TaskPriority } from "@prisma/client";
import prisma from "../../lib/prisma";

function clampPosition(position: number, maxPosition: number) {
  return Math.max(0, Math.min(position, maxPosition));
}

async function getOwnedTaskOrNull(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        ownerId: userId,
      },
    },
    include: {
      board: {
        include: {
          columns: true,
        },
      },
      column: true,
    },
  });
}

export async function createTaskForBoard(input: {
  userId: string;
  boardId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  columnKey: ColumnKey;
}) {
  const board = await prisma.board.findFirst({
    where: {
      id: input.boardId,
      ownerId: input.userId,
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

  return prisma.task.create({
    data: {
      boardId: board.id,
      columnId: targetColumn.id,
      authorId: input.userId,
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
}

export async function getTaskById(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        ownerId: userId,
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

export async function updateTaskById(
  userId: string,
  taskId: string,
  input: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    category?: string | null;
    dueDate?: string | null;
  },
) {
  const task = await getOwnedTaskOrNull(userId, taskId);

  if (!task) {
    return null;
  }

  const data: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) {
    data.title = input.title;
  }

  if (input.description !== undefined) {
    data.description = input.description;
  }

  if (input.priority !== undefined) {
    data.priority = input.priority;
  }

  if (input.category !== undefined) {
    data.category = input.category;
  }

  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }

  return prisma.task.update({
    where: {
      id: task.id,
    },
    data,
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

export async function deleteTaskById(userId: string, taskId: string) {
  const task = await getOwnedTaskOrNull(userId, taskId);

  if (!task) {
    return null;
  }

  await prisma.task.delete({
    where: {
      id: task.id,
    },
  });

  return {
    id: task.id,
    message: "Task deleted successfully.",
  };
}

export async function archiveTaskById(userId: string, taskId: string, archived: boolean) {
  const task = await getOwnedTaskOrNull(userId, taskId);

  if (!task) {
    return null;
  }

  return prisma.task.update({
    where: {
      id: task.id,
    },
    data: {
      archived,
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

export async function moveTaskById(
  userId: string,
  taskId: string,
  input: {
    columnKey: ColumnKey;
    position: number;
  },
) {
  const task = await getOwnedTaskOrNull(userId, taskId);

  if (!task) {
    return null;
  }

  const targetColumn = task.board.columns.find((column) => column.key === input.columnKey);

  if (!targetColumn) {
    throw new Error("Target column not found for board.");
  }

  return prisma.$transaction(async (tx) => {
    const sourceColumnId = task.columnId;
    const targetColumnId = targetColumn.id;

    if (sourceColumnId === targetColumnId) {
      const siblingTasks = await tx.task.findMany({
        where: {
          boardId: task.boardId,
          columnId: sourceColumnId,
          id: {
            not: task.id,
          },
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      const reorderedIds = siblingTasks.map((item) => item.id);
      const targetPosition = clampPosition(input.position, reorderedIds.length);

      reorderedIds.splice(targetPosition, 0, task.id);

      for (let index = 0; index < reorderedIds.length; index += 1) {
        await tx.task.update({
          where: {
            id: reorderedIds[index],
          },
          data: {
            position: index,
          },
        });
      }
    } else {
      const sourceTasks = await tx.task.findMany({
        where: {
          boardId: task.boardId,
          columnId: sourceColumnId,
          id: {
            not: task.id,
          },
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      for (let index = 0; index < sourceTasks.length; index += 1) {
        await tx.task.update({
          where: {
            id: sourceTasks[index].id,
          },
          data: {
            position: index,
          },
        });
      }

      const targetTasks = await tx.task.findMany({
        where: {
          boardId: task.boardId,
          columnId: targetColumnId,
          id: {
            not: task.id,
          },
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      const targetIds = targetTasks.map((item) => item.id);
      const targetPosition = clampPosition(input.position, targetIds.length);

      targetIds.splice(targetPosition, 0, task.id);

      for (let index = 0; index < targetIds.length; index += 1) {
        const currentId = targetIds[index];

        if (currentId === task.id) {
          await tx.task.update({
            where: {
              id: currentId,
            },
            data: {
              columnId: targetColumnId,
              position: index,
            },
          });
        } else {
          await tx.task.update({
            where: {
              id: currentId,
            },
            data: {
              position: index,
            },
          });
        }
      }
    }

    return tx.task.findUniqueOrThrow({
      where: {
        id: task.id,
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
  });
}
