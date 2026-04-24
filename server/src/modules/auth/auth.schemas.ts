import { z } from "zod";

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password is too long"),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
