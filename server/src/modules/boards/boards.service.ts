import { ColumnKey } from "@prisma/client";
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

export async function getBoards() {
  const user = await getDemoUserOrThrow();

  return prisma.board.findMany({
    where: {
      ownerId: user.id,
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

export async function createBoard(title: string) {
  const user = await getDemoUserOrThrow();

  return prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: {
        title,
        ownerId: user.id,
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
