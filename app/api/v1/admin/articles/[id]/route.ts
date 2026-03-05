import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { getAdminArticleById, saveArticleDraft } from "@/lib/services/article-service";
import { jsonError } from "@/lib/http";
import { articleDraftSchema } from "@/lib/validation/article";

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const article = await getAdminArticleById(context.params.id);
  if (!article) {
    return jsonError("Article not found", 404);
  }

  return NextResponse.json(article);
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = articleDraftSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid article payload", 400, parsed.error.flatten());
  }

  try {
    const article = await saveArticleDraft(context.params.id, parsed.data, session.user.id);
    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save article";
    return jsonError(message, 400);
  }
}
