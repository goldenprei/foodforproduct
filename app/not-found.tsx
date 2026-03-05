import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel" style={{ maxWidth: "640px", margin: "3rem auto", padding: "2rem" }}>
      <h1 style={{ marginTop: 0, fontFamily: "var(--font-heading)" }}>Not found</h1>
      <p>The page or article you requested does not exist.</p>
      <Link className="button secondary" href="/">
        Back to homepage
      </Link>
    </section>
  );
}
