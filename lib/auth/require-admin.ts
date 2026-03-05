import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  return session;
}

export async function getAdminSessionOrNull() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ? session : null;
}
