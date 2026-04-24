import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { createAccessToken } from "./auth.utils";

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

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    return {
      ok: false as const,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    return {
      ok: false as const,
      reason: "INVALID_CREDENTIALS" as const,
    };
  }

  const accessToken = createAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    ok: true as const,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
