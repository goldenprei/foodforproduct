import { redirect } from "next/navigation";

import { GithubLoginButton } from "@/components/ui/github-login-button";
import { getAdminSessionOrNull } from "@/lib/auth/require-admin";

export default async function AdminLoginPage() {
  const session = await getAdminSessionOrNull();

  if (session) {
    redirect("/admin");
  }

  return (
    <section className="panel" style={{ maxWidth: "560px", margin: "4rem auto", padding: "2rem" }}>
      <h1 style={{ marginTop: 0, fontFamily: "var(--font-heading)" }}>Admin access</h1>
      <p>Sign in with your allowlisted GitHub account to create and publish articles.</p>
      <GithubLoginButton />
    </section>
  );
}
