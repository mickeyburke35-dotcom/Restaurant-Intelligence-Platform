import { z } from "zod";

const agencySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "Enter a valid agency slug.")
  .optional()
  .or(z.literal(""));

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  agencySlug: agencySlugSchema,
  next: z.string().optional()
});

export type SignInInput = z.infer<typeof signInSchema>;

export function normalizeAgencySlug(value: SignInInput["agencySlug"]) {
  if (!value) {
    return undefined;
  }

  return value.trim().toLowerCase();
}
