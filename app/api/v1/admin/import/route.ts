import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { importContentDirectory } from "@/lib/content/importer";
import { jsonError } from "@/lib/http";

const importSchema = z.object({
  directory: z.string().trim().min(1).default("content/import"),
  publish: z.boolean().default(false)
});

export async function POST(request: Request) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = importSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid import payload", 400, parsed.error.flatten());
  }

  const result = await importContentDirectory(parsed.data.directory, {
    publish: parsed.data.publish
  });

  return NextResponse.json(result);
}
