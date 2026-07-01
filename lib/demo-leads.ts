import { z } from "zod";

export const demoLeadSource = "restaurant_demo" as const;

export const demoLeadRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address.")
});

export type DemoLeadRequest = z.infer<typeof demoLeadRequestSchema>;

export type DemoLeadResponse =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof DemoLeadRequest, string[]>>;
    };
