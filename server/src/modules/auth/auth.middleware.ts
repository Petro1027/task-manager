import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken } from "./auth.utils";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    response.status(401).json({
      message: "Authorization token is required.",
    });
    return;
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    response.status(401).json({
      message: "Authorization token is required.",
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    request.authUser = payload;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      response.status(401).json({
        message: "Access token has expired.",
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      response.status(401).json({
        message: "Invalid access token.",
      });
      return;
    }

    next(error);
  }
}
