import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    return {
      ok: false as const,
      reason: "EMAIL_ALREADY_EXISTS" as const,
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ok: true as const,
    user,
  };
}
