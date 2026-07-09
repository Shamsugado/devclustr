import { z } from "zod";

const ItemFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z.url("Invalid URL").nullable(),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()).default([]),
});

export const UpdateItemSchema = ItemFieldsSchema;

export const CreateItemSchema = ItemFieldsSchema.extend({
  typeId: z.string().min(1, "Type is required"),
  fileKey: z.string().nullable().default(null),
  fileName: z.string().nullable().default(null),
  fileSize: z.number().nullable().default(null),
});
