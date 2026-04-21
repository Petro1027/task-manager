import { ColumnKey } from "@prisma/client";
import prisma from "../src/lib/prisma";

async function main() {
  const demoUser = await prisma.user.upsert({
    where: {
      email: "demo@example.com",
    },
    update: {
      name: "Demo User",
    },
    create: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash: "demo_password_hash_not_for_production",
    },
  });

  await prisma.board.deleteMany({
    where: {
      ownerId: demoUser.id,
      title: "Demo Board",
    },
  });

  const demoBoard = await prisma.board.create({
    data: {
      title: "Demo Board",
      ownerId: demoUser.id,
    },
  });

  await prisma.column.createMany({
    data: [
      {
        boardId: demoBoard.id,
        key: ColumnKey.TODO,
        title: "To Do",
        position: 0,
      },
      {
        boardId: demoBoard.id,
        key: ColumnKey.IN_PROGRESS,
        title: "In Progress",
        position: 1,
      },
      {
        boardId: demoBoard.id,
        key: ColumnKey.DONE,
        title: "Done",
        position: 2,
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log(`Demo user email: ${demoUser.email}`);
  console.log(`Demo board title: ${demoBoard.title}`);
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
