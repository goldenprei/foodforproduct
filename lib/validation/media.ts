import { z } from "zod";

export const mediaUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(120),
  size: z.number().int().min(1).max(15 * 1024 * 1024).optional()
});
