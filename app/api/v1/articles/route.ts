import { NextRequest, NextResponse } from "next/server";

import { listPublicArticles } from "@/lib/services/article-service";
import { publicArticlesQuerySchema } from "@/lib/validation/article";

export async function GET(request: NextRequest) {
  const parsed = publicArticlesQuerySchema.safeParse({
    query: request.nextUrl.searchParams.get("query") ?? undefined,
    tag: request.nextUrl.searchParams.get("tag") ?? undefined,
    category: request.nextUrl.searchParams.get("category") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid query parameters",
          details: parsed.error.flatten()
        }
      },
      { status: 400 }
    );
  }

  const result = await listPublicArticles(parsed.data);
  return NextResponse.json(result);
}
