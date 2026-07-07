import { z } from "zod";

export const GenerateAutoTagsSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
});

// The model may return `{ "tags": [...] }` or a bare `[...]` array.
export const AutoTagResultSchema = z.array(z.string().trim().min(1)).max(10);
