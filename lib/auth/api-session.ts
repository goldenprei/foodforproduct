import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";

export async function getAdminApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return session;
}
