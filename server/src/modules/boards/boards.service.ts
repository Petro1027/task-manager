import { ColumnKey } from "@prisma/client";
import prisma from "../../lib/prisma";

export async function getBoards(userId: string) {
  return prisma.board.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: {
          position: "asc",
        },
      },
      _count: {
        select: {
          tasks: true,
          tags: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBoardById(userId: string, boardId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: {
          position: "asc",
        },
      },
      tags: {
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          tasks: true,
          tags: true,
        },
      },
    },
  });
}

export async function getBoardTasks(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

  if (!board) {
    return null;
  }

  return prisma.task.findMany({
    where: {
      boardId,
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
    orderBy: [
      {
        archived: "asc",
      },
      {
        position: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function createBoard(userId: string, title: string) {
  return prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: {
        title,
        ownerId: userId,
      },
    });

    await tx.column.createMany({
      data: [
        {
          boardId: board.id,
          key: ColumnKey.TODO,
          title: "To Do",
          position: 0,
        },
        {
          boardId: board.id,
          key: ColumnKey.IN_PROGRESS,
          title: "In Progress",
          position: 1,
        },
        {
          boardId: board.id,
          key: ColumnKey.DONE,
          title: "Done",
          position: 2,
        },
      ],
    });

    return tx.board.findUniqueOrThrow({
      where: {
        id: board.id,
      },
      include: {
        columns: {
          orderBy: {
            position: "asc",
          },
        },
        _count: {
          select: {
            tasks: true,
            tags: true,
          },
        },
      },
    });
  });
}
