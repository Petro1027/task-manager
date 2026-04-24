import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { AccessTokenPayload } from "./auth.types";

export function createAccessToken(payload: {
  userId: string;
  email: string;
  name: string;
}) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}
