import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Name the quest").max(120),
  description: z.string().max(2000).default(""),
  attribute: z.enum([
    "strength",
    "intellect",
    "discipline",
    "creativity",
    "social",
  ]),
  difficulty: z.enum(["trivial", "easy", "normal", "hard", "epic"]),
  due_at: z.string().optional().nullable(),
});

export const authSchema = z.object({
  email: z.string().email("Need a real email"),
  password: z.string().min(8, "At least 8 characters"),
  display_name: z.string().trim().min(1).max(40).optional(),
});

export const identitySchema = z.object({
  display_name: z.string().trim().min(1).max(40),
  timezone: z.string().min(1).max(64),
});

export type TaskInput = z.infer<typeof taskSchema>;
