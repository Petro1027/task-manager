import type { AccessTokenPayload } from "../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      authUser?: AccessTokenPayload;
    }
  }
}

export {};
