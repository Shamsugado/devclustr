import { z } from "zod";

export const GenerateAutoTagsSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
});

// The model may return `{ "tags": [...] }` or a bare `[...]` array.
export const AutoTagResultSchema = z.array(z.string().trim().min(1)).max(10);

export const GenerateAutoSummarySchema = z.object({
  title: z.string().trim(),
  content: z.string().nullable(),
  url: z.string().trim().nullable(),
  language: z.string().trim().nullable(),
  fileName: z.string().trim().nullable(),
});

// The model may return `{ "summary": "..." }` or a bare string.
export const AutoSummaryResultSchema = z.string().trim().min(1).max(500);

export const ExplainCodeSchema = z.object({
  content: z.string(),
  language: z.string().trim().nullable(),
});

// The model may return `{ "explanation": "..." }` or a bare string.
export const ExplainCodeResultSchema = z.string().trim().min(1).max(3000);

export const OptimizePromptSchema = z.object({
  content: z.string(),
});

// The model may return `{ "prompt": "..." }` or a bare string.
export const OptimizePromptResultSchema = z.string().trim().min(1).max(4000);
