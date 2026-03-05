import { NextResponse } from "next/server";

import { getAdminApiSession } from "@/lib/auth/api-session";
import { jsonError } from "@/lib/http";
import { unpublishArticle } from "@/lib/services/article-service";

export async function POST(_: Request, context: { params: { id: string } }) {
  const session = await getAdminApiSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const article = await unpublishArticle(context.params.id, session.user.id);
    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unpublish article";
    return jsonError(message, 400);
  }
}
