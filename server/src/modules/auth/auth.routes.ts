import { Router } from "express";
import { ZodError } from "zod";
import { requireAuth } from "./auth.middleware";
import { loginBodySchema, registerBodySchema } from "./auth.schemas";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";

const router = Router();

router.post("/register", async (request, response, next) => {
  try {
    const body = registerBodySchema.parse(request.body);

    const result = await registerUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    if (!result.ok) {
      response.status(409).json({
        message: "Email is already in use.",
      });
      return;
    }

    response.status(201).json({
      message: "Registration successful.",
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid request body.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const body = loginBodySchema.parse(request.body);

    const result = await loginUser({
      email: body.email,
      password: body.password,
    });

    if (!result.ok) {
      response.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    response.status(200).json({
      message: "Login successful.",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Invalid request body.",
        errors: error.flatten(),
      });
      return;
    }

    next(error);
  }
});

router.get("/me", requireAuth, async (request, response, next) => {
  try {
    const authUser = request.authUser;

    if (!authUser) {
      response.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const user = await getCurrentUser(authUser.userId);

    if (!user) {
      response.status(404).json({
        message: "User not found.",
      });
      return;
    }

    response.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
