import { z } from "zod";

export const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .nullable(),
});

export const UpdateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .nullable(),
});
