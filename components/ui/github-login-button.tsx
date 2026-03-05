"use client";

import { signIn } from "next-auth/react";

export function GithubLoginButton() {
  return (
    <button
      onClick={() => {
        void signIn("github", { callbackUrl: "/admin" });
      }}
      type="button"
    >
      Sign in with GitHub
    </button>
  );
}
