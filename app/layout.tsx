import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "FoodforProduct",
  description: "Thoughts on product management, AI, metrics, and maths"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="site-header__inner">
              <Link href="/" className="site-title">
                foodforproduct
              </Link>
              <nav className="site-nav">
                <Link href="/">Articles</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
