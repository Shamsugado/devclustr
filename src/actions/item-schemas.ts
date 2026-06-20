import { z } from "zod";

export const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z.url("Invalid URL").nullable(),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)),
});

export const CreateItemSchema = z.object({
  typeId: z.string().min(1, "Type is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z.url("Invalid URL").nullable(),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)),
});
