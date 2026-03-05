import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }
    return value;
  })
  .refine((value) => value === null || /^https?:\/\//.test(value), {
    message: "coverImageUrl must be an absolute URL"
  });

export const articleDraftSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z
    .string()
    .trim()
    .max(320)
    .optional()
    .transform((value) => value || null),
  contentJson: z.record(z.any()),
  category: z.string().trim().min(1).max(120),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  coverImageUrl: urlOrEmpty
});

export const publishSchema = z.object({
  publishAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((value) => (value ? new Date(value) : null))
});

export const publicArticlesQuerySchema = z.object({
  query: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
