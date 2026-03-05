import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { createArticleDraft } from "@/lib/services/article-service";

export default async function CreateNewArticlePage() {
  const session = await requireAdminSession();
  const article = await createArticleDraft(session.user.id);
  redirect(`/admin/articles/${article.id}/edit`);
}
