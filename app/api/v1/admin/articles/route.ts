import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { createArticleDraft, listAdminArticles } from "@/lib/services/article-service";
import { jsonError } from "@/lib/http";

export async function GET() {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const articles = await listAdminArticles();
  return NextResponse.json({ items: articles });
}

export async function POST() {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const article = await createArticleDraft(session.user.id);
  return NextResponse.json(article, { status: 201 });
}
