import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function createAccessToken(payload: {
  userId: string;
  email: string;
  name: string;
}) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
}
