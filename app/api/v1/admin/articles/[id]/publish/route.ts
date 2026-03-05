import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { jsonError } from "@/lib/http";
import { publishArticle } from "@/lib/services/article-service";
import { publishSchema } from "@/lib/validation/article";

export async function POST(request: Request, context: { params: { id: string } }) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = publishSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid publish payload", 400, parsed.error.flatten());
  }

  try {
    const article = await publishArticle(context.params.id, parsed.data.publishAt, session.user.id);
    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish article";
    return jsonError(message, 400);
  }
}
