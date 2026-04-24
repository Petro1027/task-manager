import { Router } from "express";
import { ZodError } from "zod";
import { registerBodySchema } from "./auth.schemas";
import { registerUser } from "./auth.service";

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

export default router;
