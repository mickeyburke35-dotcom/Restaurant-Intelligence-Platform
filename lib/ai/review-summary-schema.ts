import { z } from "zod";

export const reviewSummaryRequestSchema = z.object({
  reviewText: z
    .string()
    .trim()
    .min(1, "Enter fictional restaurant review text before generating a summary.")
    .max(5000, "Review text must be 5,000 characters or fewer.")
});

export const reviewSummaryResponseSchema = z.object({
  summary: z.string().trim().min(1).max(700),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed", "unknown"]),
  keyThemes: z.array(z.string().trim().min(1).max(80)).min(1).max(6)
});

export const reviewSummaryApiErrorSchema = z.object({
  error: z.string().min(1)
});

export type ReviewSummaryRequest = z.infer<typeof reviewSummaryRequestSchema>;
export type ReviewSummaryResponse = z.infer<typeof reviewSummaryResponseSchema>;

